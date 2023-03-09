
export type CartItem = {
  name: string;
  price: number;
  quantity: number;
}

export type Cart = {
  items: CartItem[]
}

const withSameName = (name: string) => (x: CartItem) => {
  return x.name === name
}

export const addItem = (cart: Cart, item: CartItem) => {
  const itemOnCart = cart.items.find(withSameName(item.name))
  console.log('ioc', itemOnCart)
  if (itemOnCart) {
    itemOnCart.quantity++;
    return
  }

  cart.items.push(item)
}
