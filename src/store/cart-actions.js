/*
Creamos el ACTION CREATOR aca, es la alternativa a la otra forma donde colocamos la logica en el componente app.js
Todos los metodos en los reducers reciben estos action creator, pero los crea automaticamente redux.

Y vemos, como la diferencia en el dispatch porque generalmente eran funcion que retornaban un objeto action, mientras que ahora dispatch una funcion, que retorna OTRA funcion. Pero redux esta preparado tambien para esta segunda forma, y redux ejecutara esa funcion (la q retorna la funcion), y ahi dentro de esa funcion podemos dispatch otra vez. 

ESTA FORMA, ES SIMPLEMENTE UNA ALTERNATIVA QUE PERMITE MANTENER A LOS COMPONENTES MAS LIMPIOS, en el caso de App.js simplemente tendriamos esas 6 lineas de arriba y no toda la logica que hay ahora, porque esa logica se migra a este sendCartData o Action Creator. 

*/

import { uiActions } from "./ui-slice";

export const sendCartData = (cart) => {
  //Antes del dispatch podemos hacer todo lo asyncrono o side effects que querramos, porque no tamos en el reducer.
  return async (dispatch) => {
    dispatch(
      uiActions.showNotifacion({
        status: "pending",
        title: "Sending...",
        message: "Sending cart data!",
      })
    );

    const sendRequest = async () => {
      const response = await fetch(
        "https://react-http-37429-default-rtdb.firebaseio.com/cart.json",
        {
          method: "PUT",
          body: JSON.stringify({
            items: cart.items,
            totalQuantity: cart.totalQuantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Sending cart data failed.");
      }
    };

    try {
      await sendRequest();

      dispatch(
        uiActions.showNotifacion({
          status: "success",
          title: "Success!",
          message: "Sent cart data successfully!",
        })
      );
    } catch (error) {
      dispatch(
        uiActions.showNotifacion({
          status: "error",
          title: "Error!",
          message: "Sending cart data failed!",
        })
      );
    }
  };
};

import { cartActions } from "./cart-slice";

//Ahora el action creator para LEER la data del server:
export const fetchCartData = () => {
  return async (dispatch) => {
    const fetchData = async () => {
      const response = await fetch(
        "https://react-http-37429-default-rtdb.firebaseio.com/cart.json"
      );

      if (!response.ok) {
        throw new Error("Could not fetch cart data!");
      }

      const data = await response.json();

      return data;
    };

    try {
      const cartData = await fetchData(); //Es la data que retorna la linea 74. Tiene el formato que vemos en el firebase, con las 2 keys item y totalquantity. En este caso, no necesitamos transformar la data, porque no usamos POST y si PUT, y tenemos el formato que necesitamos
      dispatch(
        cartActions.replaceCart({
          items: cartData.items || [], //Asi nos aseguramos que items nunca sea undefined, y evitar que rompa cuando recargamos la pagina y el carrito esta vacio.
          totalQuantity: cartData.totalQuantity,
        })
      ); //Y aca actualizamos el carrito.
    } catch (error) {
      dispatch(
        uiActions.showNotifacion({
          status: "error",
          title: "Error!",
          message: "Fetching cart data failed!",
        })
      );
    }
  };
};
