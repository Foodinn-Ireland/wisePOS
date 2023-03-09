from decouple import config
from typing import Union

from math import trunc
from fastapi import FastAPI
from pydantic import BaseModel
import stripe
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stripe_pk = config('STRIPE_PUBLISHABLE_KEY')
stripe_sk = config('STRIPE_SECRET_KEY')
stripe.api_key = stripe_sk

# CONNECTED_ACCOUNT = 'acct_' Not using it
LOCATION = 'tml_'

class StripePos(BaseModel):
    slug: str

class Address(BaseModel):
    line1: str
    city: str
    postal_code: str
    state: str
    country: str

class StripeLocation(BaseModel):
    display_name: str
    address: Address

class Data(BaseModel):
    amount: float

class PaymentIntent(BaseModel):
    payment_intent_id: str

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/stripe/pk")
def get_stripe_key() -> str:
    return stripe_pk


@app.get("/stripe/connection_token")
def get_connection_token() -> str:
    connection_token = stripe.terminal.ConnectionToken.create(
        # stripe_account=CONNECTED_ACCOUNT
    )
    return connection_token.get('secret')


@app.get("/stripe/location")
def get_location():
    locations = stripe.terminal.Location.list(
        limit=3,
        # stripe_account=CONNECTED_ACCOUNT
    )
    print(locations)
    return locations.data[0]['id']


@app.post("/stripe/location")
def post_location(location: StripeLocation):

    res = stripe.terminal.Location.create(
        display_name=location.display_name,
        address={
            "line1": location.address.line1,
            "city": location.address.city,
            "postal_code": location.address.postal_code,
            "state": location.address.state,
            "country": location.address.country,
        },
    )
    print(res)
    return res


@app.post("/stripe/pos/register")
def register_pos(pos: StripePos):
    res = stripe.terminal.Reader.create(
        registration_code=pos.slug,
        label="Levi's Reader",
        location=LOCATION,
    )
    return res

@app.post("/stripe/pos/register/simulated")
def register_pos_simulated():

    res = stripe.terminal.Reader.create(
        registration_code="simulated-wpe",
        label="Levi's Simulated Reader",
        location=LOCATION,
        # stripe_account=CONNECTED_ACCOUNT
    )
    return res


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post('/stripe/create_payment_intent')
def create_payment_intent(data: Data):
  ammount = trunc(data.amount * 100)

  # For Terminal payments, the 'payment_method_types' parameter must include
  # 'card_present'.
  # To automatically capture funds when a charge is authorized,
  # set `capture_method` to `automatic`.
  intent = stripe.PaymentIntent.create(
    amount=ammount,
    currency='eur',
    payment_method_types=[
      'card_present',
    ],
    capture_method='manual',
    # stripe_account=CONNECTED_ACCOUNT
  )
  return intent

@app.post('/stripe/capture_payment_intent')
def capture(payment_intent: PaymentIntent):
  intent = stripe.PaymentIntent.capture(
    payment_intent.payment_intent_id,
    # stripe_account=CONNECTED_ACCOUNT
  )

  return intent
