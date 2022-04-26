import { createContext, ReactNode, useContext, useState } from 'react';
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

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const { data: stock } = await api.get(`/stock/${productId}`);
      const { data: product } = await api.get(`/products/${productId}`);

      const find = cart.find(i => i.id === productId);
      const amount = find ? find.amount+1 : 1;

      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const itemUpdate = find ? { ...product, amount: amount } : { ...product, amount };

      const without = cart.filter(i => i.id !== productId);
      const newCart = [...without, itemUpdate];
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      setCart(newCart);

    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const find  = cart.find(i=> i.id === productId);
      if(!find){
        throw new Error('product not exist');
      }

      const newArr = cart.filter(i => i.id !== productId);
      setCart(newArr)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newArr));
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const { data: stock } = await api.get(`/stock/${productId}`);

      const find = cart.find(i => i.id === productId);
      if (!find) throw new Error('product not found');


      if (amount > stock.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      if(amount<1){
        throw new Error(' not update product to value smaller than 1')
      }

      const without = cart.filter(i => i.id !== productId);
      const updatedProduct = { ...find, amount };
      setCart([...without, updatedProduct]);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify([...without, updatedProduct]));
    } catch {
      // TODO
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
