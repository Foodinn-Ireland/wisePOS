<script setup lang="ts">
import { onMounted, reactive, ref} from 'vue';
import axios from 'axios';
import { useStripeTerminal } from './stripe-terminal'
import Readers from './Readers.vue'
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

// const terminal = ref<Awaited<ReturnType<typeof useStripeTerminal>>>()

// ;

const { readers, connectReader, refreshReaders } = await useStripeTerminal({http, location: stripe.location});



// const StripeTerminal = await loadStripeTerminal()
// const terminal = await StripeTerminal!.create({
//   async onFetchConnectionToken(){
//     const tk = await http.get('/stripe/connection_token').catch(err => {
//       console.error('err', err)
//     })
//     console.log('tk', tk);


//     return tk?.data
//   },
//   onUnexpectedReaderDisconnect(err){
//     console.error('error', err)
//   }
// })

// const discoverResult = await terminal.discoverReaders({location})

// console.log('dr', discoverResult)

// let discoveredReaders
// if (discoverResult.error) {
//   console.log('Failed to discover: ', discoverResult.error);
// } else if (discoverResult.discoveredReaders.length === 0) {
//   console.log('No available readers.');
// } else {
//   discoveredReaders = discoverResult.discoveredReaders;
//   console.log('terminal.discoverReaders', discoveredReaders);
// }

// const connect = (reader: Reader) => {
//   console.log('reader', reader.id);

//   terminal.connectReader(reader).then(function(connectResult) {
//     if (connectResult.error) {
//       console.log('Failed to connect: ', connectResult.error);
//     } else {
//         console.log('Connected to reader: ', connectResult.reader.label);
//         console.log('terminal.connectReader', connectResult)

//         terminal.setReaderDisplay({
//           type: 'cart',
//           cart: {
//             currency: 'usd',
//             line_items: [
//               {
//                 amount: 5100,
//                 description: 'Red t-shirt',
//                 quantity: 1,
//               },
//             ],
//             tax: 100,
//             total: 5200,
//           },
//         })
//     }
//   });
// }
// const disconnect = async (reader: Reader) => {
//   console.log('reader', reader.id)
//   const res = await terminal.disconnectReader()
//   console.log('disconnect', res)
// }

// const capture = async (payload:any) => {
//   return http.post('/stripe/capture_payment_intent', payload)
//   .then(function(response) {
//     return response.data
//   })
//   .then(function(data) {
//     console.log('server.capture', data);
//   });
// }
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
</script>

<template>
  <h1>{{ msg }}</h1>
  <button @click="refreshReaders">Refresh Readers</button>
  <Readers :model-value="readers" @connect="connectReader"/>
  <!-- <pre>
    {{ terminal?.state.readers }}
  </pre> -->

  <input v-model.number="amount"/>


  <!-- <button @click="createPaymentIntent(amount)">Create Payment Intent</button> -->
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
