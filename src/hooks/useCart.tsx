import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

const getProduct = async (productId: number): Promise<Product> => {
  const { data: product } = await api.get(`/products/${productId}`);
  return product;
}

const getStock = async (productId: number): Promise<Stock> => {
  const { data: stock } = await api.get(`/stock/${productId}`);
  return stock;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => Promise<void>;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => Promise<void>;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if(storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const prevCartRef = useRef<Product[]>();

  useEffect(() => {
    prevCartRef.current = cart;
  });

  const cartPreviousValue = prevCartRef.current ?? cart;
  
  useEffect(() => {

    if(cartPreviousValue !== cart){
      const cartStr = JSON.stringify(cart);
      localStorage.setItem('@RocketShoes:cart', cartStr);
    }

  }, [cart, cartPreviousValue]);

  const addProduct = async (productId: number) => {
    try {
      
      const product = await getProduct(productId);

      if(product){
        
        const stock = await getStock(product.id);
        const productIsInCart = cart.find((x) => x.id === productId);

        if(productIsInCart){
          if(productIsInCart.amount >= stock.amount){
            toast.error('Quantidade solicitada fora de estoque');
            return;
          }
          
          productIsInCart.amount++;
          setCart([...cart]);
        }
        else{
          setCart([...cart, {
            ...product,
            amount: 1
          }])
        }

      }
      else{
        throw new Error();
      }
      
    } catch {
      toast.error('Erro na adi????o do produto');
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      
      const product = await getProduct(productId);

      if(product){
        const newCart = cart.filter((product) => product.id !== productId);
        setCart([...newCart]);
      }
      else{
        toast.error('Erro na remo????o do produto');
        return;
      }

    } catch {
      toast.error('Erro na remo????o do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      
      if(amount <= 0) return;

      const product = await getProduct(productId);

      if(!product){
        toast.error('Erro na altera????o de quantidade do produto');
        return;
      }

      const productIsInCart = cart.find((x) => x.id === productId);

      if(productIsInCart){
        const stock = await getStock(productId);
        
        if(amount > stock.amount){
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

        productIsInCart.amount = amount;
        setCart([...cart]);
      }

    } catch {
      toast.error('Erro na altera????o de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
