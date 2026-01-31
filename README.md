# EYSH - Элсэлтийн Шалгалтанд Бэлдэх Систем

Сурагчдын түвшинг тодорхойлж, сул талыг олж, хувь хүнд тохирсон сургалтын roadmap үүсгэх + Mentor холболтын систем.

## 🏗️ Төслийн Бүтэц

```
EYSH/
├── frontend/          # Next.js (TypeScript, Tailwind CSS)
├── backend/           # FastAPI (Python)
├── ml/                # Machine Learning
│   ├── notebooks/     # Jupyter notebooks (сургалт)
│   ├── trained_models/# Сургагдсан моделүүд
│   └── data/          # Өгөгдөл
└── README.md
```

## 🛠️ Технологи

| Layer | Технологи |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.11, Motor (async MongoDB) |
| Database | MongoDB |
| ML | Jupyter, scikit-learn, XGBoost, PyTorch |

## 🚀 Эхлүүлэх

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### ML Notebooks
```bash
cd ml
pip install -r requirements.txt
jupyter notebook
```

## 🤖 ML Моделүүд

1. **Level Predictor** - Сурагчийн түвшин тодорхойлох
2. **Weakness Detector** - Сул сэдэв/чадвар олох
3. **Adaptive Selector** - Дараагийн асуулт сонгох
4. **Roadmap Generator** - Сургалтын төлөвлөгөө үүсгэх
5. **Mentor Matcher** - Тохирох mentor олох

## 📝 License

MIT
