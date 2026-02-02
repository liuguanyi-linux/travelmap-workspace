import urllib.request
import json

def get_favorites():
    try:
        print('Testing Favorites...')
        with urllib.request.urlopen('http://localhost:3000/favorites/1') as response:
            if response.status == 200:
                print('Favorites:', json.loads(response.read().decode()))
            else:
                print('Error fetching favorites:', response.status)
    except Exception as e:
        print('Exception Favorites:', e)

def create_poi():
    try:
        print('\nTesting Create POI...')
        data = {
            'amapId': 'test_poi_1',
            'name': 'Test Hotel',
            'type': 'Hotel',
            'address': 'Test Address'
        }
        req = urllib.request.Request('http://localhost:3000/pois', 
                                     data=json.dumps(data).encode('utf-8'),
                                     headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            if response.status in [200, 201]:
                print('POI Created:', json.loads(response.read().decode()))
            else:
                print('Error creating POI:', response.status)
    except Exception as e:
        print('Exception Create POI:', e)

get_favorites()
create_poi()
