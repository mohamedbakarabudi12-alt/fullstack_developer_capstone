"""HTTP helpers for the dealership Mongo API and sentiment service."""

import os
from urllib.parse import quote

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv('backend_url', 'http://localhost:3030').rstrip('/')
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url', 'http://localhost:5050/'
).rstrip('/') + '/'


def get_request(endpoint, **kwargs):
    response = requests.get(f'{backend_url}/{endpoint.lstrip("/")}', timeout=5, **kwargs)
    response.raise_for_status()
    return response.json()


def get_dealers(state=None):
    endpoint = 'fetchDealers' if not state else f'fetchDealers/{quote(state, safe="")}'
    return get_request(endpoint)


def get_dealer(dealer_id):
    return get_request(f'fetchDealer/{dealer_id}')


def get_reviews(dealer_id):
    return get_request(f'fetchReviews/dealer/{dealer_id}')


def get_cars():
    return get_request('fetchCars')


def analyze_review_sentiments(text):
    try:
        response = requests.get(
            f'{sentiment_analyzer_url}analyze/{quote(text, safe="")}', timeout=3
        )
        response.raise_for_status()
        result = response.json()
        if result.get('sentiment') in {'positive', 'neutral', 'negative'}:
            return result['sentiment']
    except (requests.RequestException, ValueError):
        pass
    return 'neutral'


def post_review(data_dict):
    response = requests.post(
        f'{backend_url}/insert_review', json=data_dict, timeout=5
    )
    response.raise_for_status()
    return response.json()
