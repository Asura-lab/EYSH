import os
import joblib
from typing import List, Dict, Any, Optional
from pathlib import Path

from app.models import WeekPlan


class MLService:
    """ML моделуудыг ачаалж, inference хийх service"""
    
    def __init__(self):
        self.models_path = Path(__file__).parent.parent.parent.parent / "ml" / "trained_models"
        self.level_predictor = None
        self.weakness_detector = None
        self.roadmap_generator = None
        self.mentor_matcher = None
        
        self._load_models()
    
    def _load_models(self):
        """Сургагдсан моделуудыг ачаалах"""
        try:
            level_path = self.models_path / "level_predictor.pkl"
            if level_path.exists():
                self.level_predictor = joblib.load(level_path)
                print("Level predictor loaded")
        except Exception as e:
            print(f"Could not load level_predictor: {e}")
        
        try:
            weakness_path = self.models_path / "weakness_detector.pkl"
            if weakness_path.exists():
                self.weakness_detector = joblib.load(weakness_path)
                print("Weakness detector loaded")
        except Exception as e:
            print(f"Could not load weakness_detector: {e}")
    
    def predict_level(self, question_results: List[Dict]) -> int:
        """
        Сурагчийн түвшинг тодорхойлох
        
        Args:
            question_results: Асуултын хариултууд
        
        Returns:
            Түвшин (1-10)
        """
        if self.level_predictor is not None:
            # TODO: Feature extraction and prediction
            # features = self._extract_features(question_results)
            # return self.level_predictor.predict([features])[0]
            pass
        
        # Fallback: Simple rule-based
        correct = sum(1 for q in question_results if q.get("is_correct", False))
        total = len(question_results)
        
        if total == 0:
            return 5
        
        score_pct = correct / total * 100
        
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
        if self.weakness_detector is not None:
            # TODO: ML-based detection
            pass
        
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
        target_score: int = 700
    ) -> List[WeekPlan]:
        """
        Хувийн roadmap үүсгэх
        
        Args:
            level: Одоогийн түвшин
            weak_topics: Сул сэдвүүд
            target_score: Зорилтот оноо
        
        Returns:
            Долоо хоног тус бүрийн төлөвлөгөө
        """
        # Calculate weeks needed
        weeks_needed = max(4, (10 - level) * 2)
        
        weeks = []
        for i in range(1, weeks_needed + 1):
            # Focus on weak topics first
            if i <= len(weak_topics):
                focus_topic = weak_topics[i - 1] if i <= len(weak_topics) else "Нийт давталт"
            else:
                focus_topic = "Нийт давталт"
            
            week = WeekPlan(
                week_number=i,
                topics=[focus_topic],
                goals=[
                    f"{focus_topic} сэдвийг гүнзгий судлах",
                    f"Өдөрт 10 бодлого бодох",
                    f"Алдаагаа шинжлэх"
                ],
                resources=[
                    f"{focus_topic} - Онол",
                    f"{focus_topic} - Дасгал",
                    f"{focus_topic} - Шалгалтын бодлого"
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
