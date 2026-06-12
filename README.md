# Fake News Detection using NLP

Binary text classification model to detect fake vs real news articles.

## Dataset
ISOT Fake News Dataset — 44,919 articles (~56 MB)  
Download: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset

## Results
| Model | Accuracy | F1 Score | Precision | Recall | ROC-AUC |
|-------|----------|----------|-----------|--------|---------|
| Logistic Regression | 99.39% | 0.9936 | 0.9923 | 0.9949 | 0.9996 |
| Random Forest | 99.57% | 0.9954 | 0.9958 | 0.9951 | 0.9997 |

## Pipeline
- Data Cleaning & Preprocessing (URL removal, lowercasing, punctuation removal)
- Feature Engineering: TF-IDF Vectorization (50k features, unigrams + bigrams)
- Model Training: Logistic Regression + Random Forest
- Evaluation: Accuracy, F1, Precision, Recall, ROC-AUC, Confusion Matrix

## Tech Stack
Python, scikit-learn, pandas, matplotlib, seaborn, wordcloud