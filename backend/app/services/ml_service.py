import os
import joblib
import numpy as np
from typing import List, Dict, Any, Optional
from pathlib import Path

from app.models import WeekPlan


class MLService:
    """ML моделуудыг ачаалж, inference хийх service"""
    
    def __init__(self):
        self.models_path = Path(__file__).parent.parent.parent.parent / "ml" / "trained_models"
        self.level_predictor = None
        self.level_scaler = None
        self.weakness_detector = None
        self.topic_names = None
        self.roadmap_generator = None
        self.roadmap_scaler = None
        
        self._load_models()
    
    def _load_models(self):
        """Сургагдсан моделуудыг ачаалах"""
        try:
            level_path = self.models_path / "level_predictor.joblib"
            scaler_path = self.models_path / "level_scaler.joblib"
            if level_path.exists() and scaler_path.exists():
                self.level_predictor = joblib.load(level_path)
                self.level_scaler = joblib.load(scaler_path)
                print("[OK] Level predictor loaded")
        except Exception as e:
            print(f"[ERROR] Could not load level_predictor: {e}")
        
        try:
            weakness_path = self.models_path / "weakness_detector.joblib"
            topics_path = self.models_path / "topic_names.joblib"
            if weakness_path.exists() and topics_path.exists():
                self.weakness_detector = joblib.load(weakness_path)
                self.topic_names = joblib.load(topics_path)
                print("[OK] Weakness detector loaded")
        except Exception as e:
            print(f"[ERROR] Could not load weakness_detector: {e}")
        
        try:
            roadmap_path = self.models_path / "roadmap_generator.joblib"
            roadmap_scaler_path = self.models_path / "roadmap_scaler.joblib"
            if roadmap_path.exists() and roadmap_scaler_path.exists():
                self.roadmap_generator = joblib.load(roadmap_path)
                self.roadmap_scaler = joblib.load(roadmap_scaler_path)
                print("[OK] Roadmap generator loaded")
        except Exception as e:
            print(f"[ERROR] Could not load roadmap_generator: {e}")
    
    def predict_level(self, question_results: List[Dict]) -> int:
        """
        Сурагчийн түвшинг тодорхойлох
        
        Args:
            question_results: Асуултын хариултууд
        
        Returns:
            Түвшин (1-10)
        """
        if not question_results:
            return 5
        
        # Extract features
        total = len(question_results)
        correct = sum(1 for q in question_results if q.get("is_correct", False))
        correct_ratio = correct / total if total > 0 else 0
        
        # Calculate average time
        times = [q.get("time_taken", 60) for q in question_results]
        avg_time = sum(times) / len(times) if times else 60
        
        # Hard questions (difficulty >= 3)
        hard_qs = [q for q in question_results if q.get("difficulty", 1) >= 3]
        hard_correct = sum(1 for q in hard_qs if q.get("is_correct", False))
        hard_ratio = hard_correct / len(hard_qs) if hard_qs else 0
        
        # Topic scores
        topic_scores = {
            'algebra': 50, 'geometry': 50, 'trigonometry': 50,
            'calculus': 50, 'probability': 50
        }
        
        for topic in topic_scores:
            topic_qs = [q for q in question_results if q.get("topic") == topic]
            if topic_qs:
                correct_in_topic = sum(1 for q in topic_qs if q.get("is_correct", False))
                topic_scores[topic] = (correct_in_topic / len(topic_qs)) * 100
        
        if self.level_predictor is not None and self.level_scaler is not None:
            features = np.array([[
                correct_ratio,
                avg_time,
                hard_ratio,
                topic_scores['algebra'],
                topic_scores['geometry'],
                topic_scores['trigonometry'],
                topic_scores['calculus'],
                topic_scores['probability']
            ]])
            features_scaled = self.level_scaler.transform(features)
            level = self.level_predictor.predict(features_scaled)[0]
            return int(level)
        
        # Fallback: Simple rule-based
        score_pct = correct_ratio * 100
        
        if score_pct >= 90:
            return 10
        elif score_pct >= 80:
            return 8
        elif score_pct >= 70:
            return 7
        elif score_pct >= 60:
            return 6
        elif score_pct >= 50:
            return 5
        elif score_pct >= 40:
            return 4
        elif score_pct >= 30:
            return 3
        else:
            return 2
    
    def detect_weaknesses(
        self, 
        question_results: List[Dict], 
        topics_wrong: List[str]
    ) -> List[str]:
        """
        Сул сэдвүүдийг олох
        
        Args:
            question_results: Асуултын хариултууд
            topics_wrong: Буруу хариулсан сэдвүүд
        
        Returns:
            Сул сэдвүүдийн жагсаалт
        """
        if self.weakness_detector is not None and self.topic_names is not None:
            # Calculate score for each topic
            topic_scores = {}
            for topic in self.topic_names:
                topic_qs = [q for q in question_results if q.get("topic") == topic]
                if topic_qs:
                    correct = sum(1 for q in topic_qs if q.get("is_correct", False))
                    topic_scores[topic] = correct / len(topic_qs)
                else:
                    topic_scores[topic] = 0.5  # Default
            
            # Create feature array
            features = np.array([[topic_scores.get(t, 0.5) for t in self.topic_names]])
            
            # Predict weakest topic
            weakest_idx = self.weakness_detector.predict(features)[0]
            
            # Get all topics with score < 0.5
            weak_topics = [t for t, s in topic_scores.items() if s < 0.5]
            
            # Make sure the predicted weakest is included
            if self.topic_names[weakest_idx] not in weak_topics:
                weak_topics.insert(0, self.topic_names[weakest_idx])
            
            return weak_topics[:3]  # Return top 3 weak topics
        
        # Fallback: Count topics
        from collections import Counter
        topic_counts = Counter(topics_wrong)
        
        # Return topics with >= 2 wrong answers
        weak_topics = [topic for topic, count in topic_counts.items() if count >= 2]
        
        # If none, return most common wrong topic
        if not weak_topics and topics_wrong:
            weak_topics = [topic_counts.most_common(1)[0][0]]
        
        return weak_topics
    
    def generate_roadmap(
        self, 
        level: int, 
        weak_topics: List[str],
        target_score: int = 700,
        weeks_available: int = 12
    ) -> List[WeekPlan]:
        """
        Хувийн roadmap үүсгэх
        
        Args:
            level: Одоогийн түвшин
            weak_topics: Сул сэдвүүд
            target_score: Зорилтот оноо
            weeks_available: Боломжит долоо хоногийн тоо
        
        Returns:
            Долоо хоног тус бүрийн төлөвлөгөө
        """
        # Predict recommended hours if model available
        recommended_hours = 10  # Default
        
        if self.roadmap_generator is not None and self.roadmap_scaler is not None:
            target_level = min(10, level + 3)
            topics = self.topic_names if self.topic_names else ['algebra', 'geometry', 'trigonometry', 'calculus', 'probability', 'sequences', 'functions', 'vectors']
            
            # Create feature with topic scores (assume 0.5 for all)
            features_dict = {
                'current_level': level,
                'target_level': target_level,
                'weeks_available': weeks_available
            }
            for topic in topics:
                features_dict[f'{topic}_score'] = 0.5
            
            # Mark weak topics with lower scores
            for weak in weak_topics:
                if f'{weak}_score' in features_dict:
                    features_dict[f'{weak}_score'] = 0.3
            
            features = np.array([[
                features_dict['current_level'],
                features_dict['target_level'],
                features_dict['weeks_available']
            ] + [features_dict.get(f'{t}_score', 0.5) for t in topics]])
            
            try:
                features_scaled = self.roadmap_scaler.transform(features)
                recommended_hours = max(5, min(40, self.roadmap_generator.predict(features_scaled)[0]))
            except:
                pass
        
        # Topic names in Mongolian
        topic_names_mn = {
            'algebra': 'Алгебр',
            'geometry': 'Геометр',
            'trigonometry': 'Тригонометр',
            'calculus': 'Анализ',
            'probability': 'Магадлал',
            'sequences': 'Дараалал',
            'functions': 'Функц',
            'vectors': 'Вектор'
        }
        
        # Calculate weeks needed based on level gap
        weeks_needed = max(4, min(weeks_available, (10 - level) * 2))
        
        weeks = []
        all_topics = list(topic_names_mn.keys())
        
        for i in range(1, weeks_needed + 1):
            # First focus on weak topics, then cycle through all
            if i <= len(weak_topics):
                focus_topic = weak_topics[i - 1]
            else:
                focus_topic = all_topics[(i - 1) % len(all_topics)]
            
            focus_topic_mn = topic_names_mn.get(focus_topic, focus_topic)
            
            week = WeekPlan(
                week_number=i,
                topics=[focus_topic_mn],
                goals=[
                    f"{focus_topic_mn} сэдвийн онолыг судлах",
                    f"Өдөрт {int(recommended_hours / 5)} бодлого бодох",
                    f"Алдаагаа шинжилж, давтах"
                ],
                resources=[
                    f"{focus_topic_mn} - Үндсэн онол",
                    f"{focus_topic_mn} - Жишиг даалгавар",
                    f"ЭЕШ өмнөх жилийн бодлогууд"
                ],
                practice_question_ids=[],
                completed=False
            )
            weeks.append(week)
        
        return weeks
    
    def match_mentor(
        self, 
        student_profile: Dict, 
        mentor_profiles: List[Dict]
    ) -> List[Dict]:
        """
        Тохирох mentor олох
        
        Args:
            student_profile: Сурагчийн мэдээлэл
            mentor_profiles: Mentor-уудын мэдээлэл
        
        Returns:
            Эрэмбэлсэн mentor жагсаалт
        """
        if self.mentor_matcher is not None:
            # TODO: ML-based matching
            pass
        
        # Fallback: Simple matching by subjects
        student_subjects = set(student_profile.get("subjects", []))
        
        scored_mentors = []
        for mentor in mentor_profiles:
            mentor_subjects = set(mentor.get("subjects", []))
            overlap = len(student_subjects & mentor_subjects)
            score = overlap * 10 + mentor.get("rating", 0)
            scored_mentors.append((score, mentor))
        
        scored_mentors.sort(key=lambda x: x[0], reverse=True)
        
        return [m for _, m in scored_mentors]
