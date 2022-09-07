import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
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
  removeProduct: (productId: number) => void;
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

  useEffect(() => {

    const cartStr = JSON.stringify(cart);
    localStorage.setItem('@RocketShoes:cart', cartStr);

  }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      
      const product = await getProduct(productId);

      if(product){
        
        const stock = await getStock(product.id);
        console.log(stock, product);

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
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      
      const newCart = cart.filter((product) => product.id !== productId);
      setCart([...newCart]);

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      
      if(amount <= 0) return;

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
      toast.error('Erro na alteração de quantidade do produto');
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
