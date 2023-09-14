import Cart from "./components/Cart/Cart";
import Layout from "./components/Layout/Layout";
import Products from "./components/Shop/Products";

import { UseSelector, useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { uiActions } from "./store/ui-slice";
import { Fragment } from "react";
import Notification from "./components/UI/Notification";
import { sendCartData, fetchCartData } from "./store/cart-actions";

//Esta variable es para evitar que useEffect corra la primera vez, para evitar que el carrito se sobreescriba con uno vacio.
let isInitial = true; //Esto es cuando la app comienza

function App() {
  const dispatch = useDispatch();
  //Para seleccionar DATA del store, usamos useSelector. Mientras que para hacer alguna accion es el useDispaatch
  const showCart = useSelector((state) => state.ui.cartIsVisible);

  //ACA se hace la parte de ASYNCRONICA. Y mantenemos la logica de transformar la data en el reducer, podemos hacer esto porque simplmenete cambiamos el ornden, primero actualizamos el Redux Store, y luego seleccionamos del store el cart y mandamos la request. (Esta es la opcion de usar el componente, no la del action creator.)
  const cart = useSelector((state) => state.cart); //Cuando sea que cambie el cart, todo el componete App se re ejecuta y por ende se corre el useEffect y tenemos siempre el nuevo carrito.

  //Sera null o cualquiera de los 3 objetos que mandamos aca con el disptach en funcion de como va el http PUT
  const notification = useSelector((state) => state.ui.notification);

  useEffect(() => {
    //Solo corre cuando se renderiza por primera vez. Y se renderiza cada vez que corra el componente.
    dispatch(fetchCartData());
  }, []);

  useEffect(() => {
    if (isInitial) {
      isInitial = false;
      return;
    }

    //Esto de changed es para evitar el problema de que no envie la data y se pise con el otro effect.
    if (cart.changed) {
      dispatch(sendCartData(cart));
    }
  }, [cart, dispatch]);

  return (
    <Fragment>
      {notification && (
        <Notification
          status={notification.status}
          title={notification.title}
          message={notification.message}
        ></Notification>
      )}
      <Layout>
        {showCart && <Cart />}
        <Products />
      </Layout>
    </Fragment>
  );
}

export default App;

/*

En este modulo se va a ver sobre Redux:

*Async 
*Redux DevTool ---> esto son herramienta de debuging de redux que facilitan este trabajo. Es una extension que la instalamos en el navegador. 
*Donde poner el codigo. 

Las funciones reducers deben ser:
  *PURAS --> para la misma input, siempre genera la misma salida.
  *LIBRES DE SIDE EFFECT
  *SINCRONAS 


Entonces, si queremos LEER data de un sv backend para extraer la data del carrito o ESCRIBIR data a ese sv para agregar o quitar algo al carrito, donde lo hacemos? 

Entonces donde se colocan los side effects y async tasks? Puede ser: 

  *Dentro de los componentes (usando useEffect) ---> ej en ProductItem. Esta forma, basicamente se hace toda la transformacion en los componentes, y luego los reducers simplemente se encargan de leer y guardar la data. 

  *Dentro de los action creators. Es una funcion que NO retorna la accion, pero sino OTRA FUNCION que EVENTUALMENTE retorna la accion --> una funcion que retrasa una accion para mas tarde. 

Donde debe ir el codigo entonces? 

  *Si es codigo sincronico, sin side effects (http calls) y es cosas como data transformation ---> REDUCERS y evitar Action Creator o Components. 
  *Si es codigo async o codigo con side effects ---> COMPONENTS o ACTION CREATORS, nunca usar reducers. 

Como lo hacemos aca?
PRIMERO: se realiza toda la transformacion en el reducer.
SEGUNDO: se realiza el trabajo asincronico en el componnete. 


La Frontend React App se comunica con el Backend API y viseversa:
  *Si el backend hace mucho trabajo (transforma data, y almacena la data), nuestra frontend app hace menos trabajo. 

  *Nuestro caso es que el backend solamente almacena la data tal como llega. Entonces, en nuestro frontend no solamente tenemos que mandar la data, sino tambien transformarla. Y todo ese envio, debe ser FUERA DEL REDUCER, porque no se puede hacer cosas asincronas ahi. 


*/

/*

ESTE ES EL USE EFFECT SIN USAR EL ACTION CREATOR: 


  useEffect(() => {
    const sendCartData = async () => {
      //Cuando empezamos a mandar la data:
      dispatch(
        uiActions.showNotifacion({
          status: "pending",
          title: "Sending...",
          message: "Sending cart data!",
        })
      );
      const response = await fetch(
        "https://react-http-37429-default-rtdb.firebaseio.com/cart.json",
        {
          method: "PUT", //La nueva data no va a una list, sino que sobreescribe la data, esta es la diferencia con POST.,
          body: JSON.stringify(cart),
        }
      );

      if (!response.ok) {
        throw new Error("Sending cart data failed!");
      }

      //Notificacin cuando se envio correctamente.
      dispatch(
        uiActions.showNotifacion({
          status: "success",
          title: "Success!",
          message: "Sent cart data successfully!",
        })
      );
    };

    //Si es inciial, no queremos mandar la data del carrito
    if (isInitial) {
      isInitial = false;
      return;
    }

    sendCartData().catch((error) => {
      //Notificacion cuando hay errror:
      dispatch(
        uiActions.showNotifacion({
          status: "error",
          title: "Error!",
          message: "Sending cart data failed!",
        })
      );
    });
  }, [cart, dispatch]);





*/
