<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, watchEffect} from 'vue';
import axios from 'axios';
import { ConnectionStatus, useStripeTerminal } from './stripe-terminal'
import Readers from './Readers.vue'
import Item from './Item.vue'
import { addItem, type CartItem, type Cart } from './model'
import { Reader } from '@stripe/terminal-js';
import { connect } from 'http2';
// import { type Reader } from '@stripe/terminal-js'


defineProps<{ msg: string }>()

const http = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

const loadStripeInfo = async () => {
  return {
    pk: await http.get('/stripe/pk').then(res => res.data),
    location: await http.get('/stripe/location').then(res => res.data)
  }
}

const amount = ref(0)
const stripe = reactive(await loadStripeInfo())
const cart = reactive<Cart>({
  items: []
})
const simulatedReader = ref<Reader>()
// const terminal = ref<Awaited<ReturnType<typeof useStripeTerminal>>>()

// ;

const prods = new Array(10).fill(1).map<CartItem>((x, y) =>  {
  return {
    name: `Product ${x+y}`,
    quantity: 1,
    price: Number((Math.random()*10).toFixed(2))
  }
})

console.log('prods', prods)




const {
  readers,
  status,
  payStatus,
  connectReader,
  disconnectReader,
  refreshReaders,
  setReaderDisplay,
  collectPaymentMethod
} = await useStripeTerminal({http, location: stripe.location});
refreshReaders();



// const createPaymentIntent = async (amount: number) => {
//   const res = await http.post('/stripe/create_payment_intent', {amount});

//   console.log('intent', res.data)

//   // terminal.setSimulatorConfiguration({testCardNumber: '4000000000000002'});
//   const result = await terminal.collectPaymentMethod(res.data.client_secret)

//   if (result.error) {
//     console.log(result.error)
//   } else {
//     console.log('terminal.collectPaymentMethod', result.paymentIntent);
//     const res2 = await terminal.processPayment(result.paymentIntent)
//     console.log('res2', res2)

//     if (res2.error) {
//       console.log(res2.error)
//     } else if (res2.paymentIntent) {
//       const paymentIntentId = res2.paymentIntent.id;
//       console.log('terminal.processPayment', res2.paymentIntent);

//       if (res2.paymentIntent.status === "requires_capture") {
//         console.log('require capture')
//         const res3 = await capture({"payment_intent_id": paymentIntentId})
//         console.log('res3', res3)
//       }
//     }
//   }
// }

const total = computed(() => {
  return cart.items.reduce((acc, cur) => {
    acc += cur.price * cur.quantity
    return acc;
  }, 0)
})



const onReaderConnect = async (reader: Reader) => {
  const r = await connectReader(reader);

  if (r === undefined) {
    console.log('r', r)
  }
}

const onReaderDisconnect = async (reader: Reader) => {
  const r = await disconnectReader(reader);
  console.log('ord', reader);
}

const addItemToCart = (prod: CartItem) => {
  addItem(cart, prod);
}

watchEffect(async () => {
  if (status.value !== ConnectionStatus.CONNECTED) return;

  const payload = {
    type: 'cart',
    cart: {
      currency: 'eur',
      line_items: cart.items.map(x => ({
        amount: Math.trunc(x.price * 100),
        description: x.name,
        quantity: Math.trunc(x.quantity)
      })),
      tax: 100,
      total: total.value * 100,
    },
  };

  console.log('payload', JSON.parse(JSON.stringify(payload)))

  payload.cart.total = Math.trunc(payload.cart.total)

  const r2 = await setReaderDisplay(payload)

  console.log('orc2', r2)
});

const capture = async (payload:any) => {
  return http.post('/stripe/capture_payment_intent', payload)
  .then(function(response) {
    return response.data
  })
  .then(function(data) {
    console.log('server.capture', data);
  });
}

const handlePayment = async () => {
  const res = await http.post('/stripe/create_payment_intent', {amount: total.value});
  const result = await collectPaymentMethod(res.data.client_secret)

  if (result?.paymentIntent.status === 'requires_capture'){
    console.log('require capture')
    const res3 = await capture({"payment_intent_id": result?.paymentIntent.id})
    console.log('res3', res3)
  }
}

const registerSimulated = async () => {
  const res = await http.post('/stripe/pos/register/simulated');
  console.log('register SImulated', res)

  simulatedReader.value = res.data

}

const connectSimulated = async () => {
  const res = await connectReader(simulatedReader.value!);
  console.log('connect simulated', res)
}
</script>

<template>
  Status: {{ status }} - Pay Status: {{ payStatus }}
  <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
    <button
      v-for="prod in prods"
      @click="addItemToCart(prod)"
    >
      <Item :item="prod"/>
    </button>

  </div>
  <hr/>
  <h1>{{ msg }}</h1>
  <span @click="connectSimulated">Simulated: {{  simulatedReader  }}</span>
  <button @click="registerSimulated">Register Simulated Reader</button>
  <button @click="refreshReaders">Refresh Readers</button>
  <Readers :model-value="readers" @connect="onReaderConnect" @disconnect="onReaderDisconnect"/>
  <h3>Total: {{ total }} </h3>
  <button @click="handlePayment">Pay</button>
  <pre>
    {{ cart }}
  </pre>

  <input v-model.number="amount"/>


  <!-- <button @click="createPaymentIntent(amount)">Create Payment Intent</button> -->
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
