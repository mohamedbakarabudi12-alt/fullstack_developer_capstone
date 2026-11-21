from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from requests import HTTPError, RequestException
from . import restapis


# Create your views here.

@csrf_exempt
def login_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Use POST to sign in.'}, status=405)

    try:
        data = json.loads(request.body or '{}')
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)
    if not isinstance(data, dict):
        return JsonResponse({'error': 'Request body must be a JSON object.'}, status=400)

    username = (data.get('userName') or data.get('username') or '').strip()
    password = data.get('password') or ''
    if not username or not password:
        return JsonResponse({'error': 'Username and password are required.'}, status=400)

    user = authenticate(username=username, password=password)
    if user is None:
        return JsonResponse({'error': 'Invalid username or password.'}, status=401)

    login(request, user)
    return JsonResponse({'userName': user.username, 'status': 'Authenticated'})


@csrf_exempt
def logout_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Use POST to sign out.'}, status=405)

    logout(request)
    return JsonResponse({'userName': '', 'status': 'Logged out'})


@csrf_exempt
def registration(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Use POST to create an account.'}, status=405)

    try:
        data = json.loads(request.body or '{}')
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)
    if not isinstance(data, dict):
        return JsonResponse({'error': 'Request body must be a JSON object.'}, status=400)

    username = (data.get('userName') or data.get('username') or '').strip()
    password = data.get('password') or ''
    email = (data.get('email') or '').strip()
    first_name = (data.get('firstName') or data.get('first_name') or '').strip()
    last_name = (data.get('lastName') or data.get('last_name') or '').strip()

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required.'}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({'error': 'That username is already taken.'}, status=409)

    user = User(username=username, email=email, first_name=first_name, last_name=last_name)
    try:
        validate_password(password, user)
    except ValidationError as error:
        return JsonResponse({'error': ' '.join(error.messages)}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
    except IntegrityError:
        return JsonResponse({'error': 'That username is already taken.'}, status=409)

    login(request, user)
    return JsonResponse({'userName': user.username, 'status': 'Registered'}, status=201)

def _api_error(error):
    return JsonResponse({'status': 503, 'error': str(error)}, status=503)


def get_dealerships(request, state=None):
    if request.method != 'GET':
        return JsonResponse({'error': 'Use GET to list dealerships.'}, status=405)
    try:
        return JsonResponse({'status': 200, 'dealers': restapis.get_dealers(state)})
    except RequestException as error:
        return _api_error(error)


def get_dealer_details(request, dealer_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Use GET to view a dealership.'}, status=405)
    try:
        dealer = restapis.get_dealer(dealer_id)
        return JsonResponse({'status': 200, 'dealer': [dealer]})
    except HTTPError as error:
        if error.response is not None and error.response.status_code == 404:
            return JsonResponse({'status': 404, 'error': 'Dealership not found.'}, status=404)
        return _api_error(error)
    except RequestException as error:
        return _api_error(error)


def get_dealer_reviews(request, dealer_id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Use GET to view reviews.'}, status=405)
    try:
        return JsonResponse({'status': 200, 'reviews': restapis.get_reviews(dealer_id)})
    except RequestException as error:
        return _api_error(error)


def get_car_models(request):
    try:
        return JsonResponse({'status': 200, 'CarModels': restapis.get_cars()})
    except RequestException as error:
        return _api_error(error)


@csrf_exempt
def add_review(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Use POST to submit a review.'}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Sign in before posting a review.'}, status=401)
    try:
        data = json.loads(request.body or '{}')
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)
    if not isinstance(data, dict):
        return JsonResponse({'error': 'Request body must be a JSON object.'}, status=400)

    review_text = (data.get('review') or '').strip()
    required = ('dealership', 'purchase_date', 'car_make', 'car_model', 'car_year')
    if not review_text or any(not data.get(field) for field in required):
        return JsonResponse({'error': 'All review details are required.'}, status=400)
    try:
        dealer_id = int(data['dealership'])
        car_year = int(data['car_year'])
    except (TypeError, ValueError):
        return JsonResponse({'error': 'Choose a valid dealership and car year.'}, status=400)
    if car_year < 1900 or car_year > 2035:
        return JsonResponse({'error': 'Enter a valid car year.'}, status=400)

    payload = {
        'name': request.user.get_full_name() or request.user.username,
        'dealership': dealer_id,
        'review': review_text[:2000],
        'purchase': True,
        'purchase_date': str(data['purchase_date']),
        'car_make': str(data['car_make']).strip(),
        'car_model': str(data['car_model']).strip(),
        'car_year': car_year,
        'sentiment': restapis.analyze_review_sentiments(review_text),
    }
    try:
        saved = restapis.post_review(payload)
        return JsonResponse({'status': 200, 'review': saved})
    except RequestException as error:
        return _api_error(error)
