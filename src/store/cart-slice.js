import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], totalQuantity: 0, totalAmount: 0, changed: false },
  reducers: {
    replaceCart(state, action) {
      state.totalQuantity = action.payload.totalQuantity;
      state.items = action.payload.items;
    },
    addItemToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);
      state.totalQuantity++;
      state.changed = true;

      //En caso que el item no este ya en el carrito, se agrega el objeto.
      if (!existingItem) {
        //Si no tuvieramos toolkit, esto seria malisimo porque el push modifica el arreglo original (el estado actual)
        state.items.push({
          id: newItem.id,
          price: newItem.price,
          quantity: 1,
          totalPrice: newItem.price,
          name: newItem.name,
        });
      }
      //Si ya existe, queremos actualizar la cantidad de ese item
      else {
        existingItem.quantity++;
        existingItem.totalPrice = existingItem.totalPrice + newItem.price;
      }
    },

    removeItemFromCart(state, action) {
      const id = action.payload;
      state.totalQuantity--;
      state.changed = true;

      //Tenemos que saber cuantos items hay en el arreglo de ese tipo, para saber si borrar todo el jsx o solo 1 cantidad
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem.quantity === 1) {
        //Nos quedamos con todos los items, menos los que tienen id diferente del que pasamos para borrar.
        state.items = state.items.filter((item) => item.id !== id);
      } else {
        existingItem.quantity--;
        existingItem.totalPrice = existingItem.totalPrice - existingItem.price;
      }
    },
  },
});

export const cartActions = cartSlice.actions;
export default cartSlice;
