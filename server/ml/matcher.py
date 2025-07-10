# server/ml/matcher.py
import sys, json

def cosine_similarity(a, b):
    import numpy as np
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-5)

def main():
    input_data = json.loads(sys.stdin.read())
    stored = input_data['stored']
    current = input_data['current']

    features1 = [
        stored['keystroke'].get('dwell_mean', 0),
        stored['mouse'].get('avg_speed', 0),
        stored['mouse'].get('movement_count', 0)
    ]
    features2 = [
        current['keystroke'].get('dwell_mean', 0),
        current['mouse'].get('avg_speed', 0),
        current['mouse'].get('movement_count', 0)
    ]

    similarity = cosine_similarity(features1, features2)
    print(json.dumps({ 'similarity': similarity }))

if __name__ == '__main__':
    main()
