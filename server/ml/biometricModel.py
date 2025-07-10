import sys
import json
import math

def extract_key_timings(data):
    if not data: return []
    key_timings = []
    down_times = {}

    for event in data:
        key = event['key']
        if event['type'] == 'down':
            down_times[key] = event['time']
        elif event['type'] == 'up' and key in down_times:
            duration = event['time'] - down_times[key]
            key_timings.append({'key': key, 'duration': duration})
    return key_timings

def avg_duration(key_timings):
    durations = [k['duration'] for k in key_timings]
    return sum(durations) / len(durations) if durations else 0

def cosine_similarity(a, b):
    if not a or not b or len(a) != len(b): return 0
    dot = sum(x*y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x*x for x in a))
    norm_b = math.sqrt(sum(y*y for y in b))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0

def compare(template, attempt):
    score = 0
    total = 0

    # Keystroke dynamics
    t_keys = extract_key_timings(template.get('keystrokes'))
    a_keys = extract_key_timings(attempt.get('keystrokes'))

    if t_keys and a_keys:
        t_avg = avg_duration(t_keys)
        a_avg = avg_duration(a_keys)
        diff = abs(t_avg - a_avg)
        similarity = 1 - diff / max(t_avg, a_avg, 1)
        score += similarity
        total += 1

    # Mouse movement (total distance)
    def mouse_distance(moves):
        dist = 0
        for i in range(1, len(moves)):
            dx = moves[i]['x'] - moves[i-1]['x']
            dy = moves[i]['y'] - moves[i-1]['y']
            dist += math.sqrt(dx*dx + dy*dy)
        return dist

    if template.get('mouse') and attempt.get('mouse'):
        t_dist = mouse_distance(template['mouse'])
        a_dist = mouse_distance(attempt['mouse'])
        similarity = 1 - abs(t_dist - a_dist) / max(t_dist, a_dist, 1)
        score += similarity
        total += 1

    # Touch gesture
    if template.get('touches') and attempt.get('touches'):
        t_durations = [t['duration'] for t in template['touches'] if 'duration' in t]
        a_durations = [t['duration'] for t in attempt['touches'] if 'duration' in t]
        if t_durations and a_durations and len(t_durations) == len(a_durations):
            similarity = cosine_similarity(t_durations, a_durations)
            score += similarity
            total += 1

    # Login navigation time
    if template.get('loginTime') and attempt.get('loginTime'):
        t = template['loginTime']
        a = attempt['loginTime']
        similarity = 1 - abs(t - a) / max(t, a, 1)
        score += similarity
        total += 1

    avg_similarity = score / total if total > 0 else 0
    return avg_similarity >= 0.5
# /server/ml/biometricModel.py

def extract_keystroke_features(keystrokes):
    dwell_times = []
    flight_times = []
    key_down_time = {}

    for stroke in keystrokes:
        if stroke['type'] == 'down':
            key_down_time[stroke['key']] = stroke['time']
        elif stroke['type'] == 'up':
            if stroke['key'] in key_down_time:
                dwell = stroke['time'] - key_down_time[stroke['key']]
                dwell_times.append(dwell)

    keystroke_features = {
        'dwell_mean': sum(dwell_times) / len(dwell_times) if dwell_times else 0,
        'flight_mean': sum(flight_times) / len(flight_times) if flight_times else 0,
    }
    return keystroke_features


def extract_mouse_features(mouse_data):
    if len(mouse_data) < 2:
        return {'avg_speed': 0, 'movement_count': 0}

    total_distance = 0
    total_time = mouse_data[-1]['time'] - mouse_data[0]['time']

    for i in range(1, len(mouse_data)):
        dx = mouse_data[i]['x'] - mouse_data[i-1]['x']
        dy = mouse_data[i]['y'] - mouse_data[i-1]['y']
        dist = (dx**2 + dy**2) ** 0.5
        total_distance += dist

    avg_speed = total_distance / total_time if total_time > 0 else 0

    return {
        'avg_speed': avg_speed,
        'movement_count': len(mouse_data)
    }


def generate_template(data):
    keystrokes = data.get("keystrokes", [])
    mouse = data.get("mouse", [])

    return {
        'keystroke': extract_keystroke_features(keystrokes),
        'mouse': extract_mouse_features(mouse)
    }


def main():
    
    data = json.loads(sys.stdin.read())
    template = data['template']
    attempt = data['attempt']
    match = compare(template, attempt)
    print(json.dumps({ "match": match }))

if __name__ == "__main__":
    main()
