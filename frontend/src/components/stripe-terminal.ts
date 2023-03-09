import { DiscoverResult, ErrorResponse, IPaymentIntent, ISdkManagedPaymentIntent, ISetReaderDisplayRequest, loadStripeTerminal, PaymentIntentClientSecret, type Reader} from '@stripe/terminal-js';
import { AxiosInstance } from 'axios';
import { reactive, ref } from 'vue';

type Config = {
  http: AxiosInstance;
  location: string;
}

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  NOT_CONNECTED = 'not_connected',
}

const PaymentStatus = {
  not_ready: 'Not Ready',
  ready: 'Ready',
  waiting_for_input: 'Waiting for Input',
  processing: 'Processing'
} as const;

export type PaymentStatus = keyof typeof PaymentStatus;

export const useStripeTerminal = async (config: Config) => {
  const {http, location} = config;

  const readers = ref<Reader[]>([]);
  const status = ref(ConnectionStatus.NOT_CONNECTED)
  const payStatus = ref<PaymentStatus>('not_ready')

  // FIXME:  Error most likely to happen here
  const StripeTerminal = await loadStripeTerminal();

  const terminal = await StripeTerminal?.create({
    async onFetchConnectionToken(){
      const tk = await http.get('/stripe/connection_token').catch(err => {
        console.error('err', err)
      })
      console.log('tk', tk);


      return tk?.data
    },
    onUnexpectedReaderDisconnect(err){
      console.error('error', err)
    }
  })

  const connectReader = async (reader: Reader) => {
    if (status.value !== ConnectionStatus.NOT_CONNECTED) {
      console.info('already connected')
      return;
    }

    console.log('connect Reader', reader.id)
    try {
      return terminal?.connectReader(reader).then(res => {
        status.value = terminal!.getConnectionStatus();
        payStatus.value = terminal!.getPaymentStatus();
        return res
      })
    } finally {
      status.value = terminal!.getConnectionStatus();
      payStatus.value = terminal!.getPaymentStatus();
    }
  }

  const disconnectReader = async (reader: Reader) => {
    console.log('disconnect reader', reader.id)
    return await terminal?.disconnectReader().then(res => {
      status.value = terminal!.getConnectionStatus();
      payStatus.value = terminal!.getPaymentStatus();
      return res
    })
  }

  const refreshReaders = async () => {
    console.log('refreshing...')
    const result = await terminal?.discoverReaders({location: location, simulated: false})

    if ((result as ErrorResponse).error) {
      console.error('error', (result as ErrorResponse).error)
    }

    if (!(result as DiscoverResult).discoveredReaders.length) {
      console.warn('no reader found')
    }

    readers.value = (result as DiscoverResult).discoveredReaders

    status.value = terminal!.getConnectionStatus();
    payStatus.value = terminal!.getPaymentStatus();
  }

  const setReaderDisplay = async (request: ISetReaderDisplayRequest) => {
    return terminal?.setReaderDisplay(request)
  }

  const collectPaymentMethod = async (request: PaymentIntentClientSecret) => {
    const st1 = terminal?.getConnectionStatus()
    const st2 = terminal?.getPaymentStatus()
    // terminal?.setSimulatorConfiguration({testCardNumber: '4000000000000002'});
    // terminal?.setSimulatorConfiguration({testCardNumber: '4000000000009995'});

    // terminal?.setSimulatorConfiguration({testCardNumber: '4242424242424242'});
    console.log('cp', st1, st2, request)
    try {
    const res = await terminal?.collectPaymentMethod(request) as {paymentIntent: ISdkManagedPaymentIntent};
    console.log('res', res)
    const res2 = await terminal?.processPayment(res.paymentIntent) as {paymentIntent: IPaymentIntent};
    console.log('res2', res2)
    return res2
    } catch (err) {
      console.log('errr', JSON.stringify(err))
    }
  }

  status.value = terminal!.getConnectionStatus()
  payStatus.value = terminal!.getPaymentStatus()

  return {
    // state,
    // async refreshReaders() {

    // },
    readers,
    status,
    payStatus,
    connectReader,
    disconnectReader,
    refreshReaders,
    setReaderDisplay,
    collectPaymentMethod
  }
}

