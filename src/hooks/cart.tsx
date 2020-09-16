import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE

      const asyncProducts = await AsyncStorage.getItem('@GoMarket:products');

      if (asyncProducts) {
        setProducts(JSON.parse(asyncProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productExists = products.find(item => item.id === product.id);

      if (productExists) {
        setProducts(
          /**Vai ir uma a um e vai preencher com o item normal ou com item + sua cantidade alterada */
          products.map((item /**Lembrar que o map devolve um array novo */) =>
            item.id === product.id
              ? { ...product, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      //Salvar no Storage
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART

      const incrementedProducts = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(incrementedProducts);

      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(incrementedProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const noDecrement = products.find(item => item.id === id);
      let decrementedProducts: Product[] = [];

      if (noDecrement && noDecrement.quantity <= 1) {
        decrementedProducts = products.filter(item => item.id !== id);

        setProducts(decrementedProducts);
      } else {
        decrementedProducts = products.map(item =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        );
        setProducts(decrementedProducts);
      }

      //atualizamos o storage
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(decrementedProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
