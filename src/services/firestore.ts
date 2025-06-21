import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  where
} from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { Order, User } from '@/types';

// Generate sequential order ID
export const generateOrderId = async (): Promise<string> => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('CreatedAt', 'desc'), limit(1));
  const querySnapshot = await getDocs(q);
  
  let nextNumber = 1001;
  if (!querySnapshot.empty) {
    const lastOrder = querySnapshot.docs[0].data();
    const lastId = lastOrder.ID;
    if (lastId && lastId.startsWith('ORD-DR-')) {
      const lastNumber = parseInt(lastId.split('-')[2], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
  }
  
  return `ORD-DR-${nextNumber}`;
};

// Orders CRUD operations
export const createOrder = async (orderData: Omit<Order, 'ID' | 'CreatedAt' | 'UpdatedAt'>) => {
  const orderId = await generateOrderId();
  const now = new Date().toISOString();
  
  const order: Order = {
    ...orderData,
    ID: orderId,
    CreatedAt: now,
    UpdatedAt: now
  };
  
  const docRef = await addDoc(collection(db, 'orders'), order);
  return { id: docRef.id, ...order };
};

export const getOrders = async (page: number = 1, pageSize: number = 10) => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('CreatedAt', 'desc'), limit(pageSize));
  
  const querySnapshot = await getDocs(q);
  const orders = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order & { id: string }));
  
  return {
    orders,
    totalOrders: orders.length,
    currentPage: page,
    totalPages: Math.ceil(orders.length / pageSize)
  };
};

export const getOrderById = async (orderId: string) => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (orderSnap.exists()) {
    return { id: orderSnap.id, ...orderSnap.data() } as Order & { id: string };
  }
  return null;
};

export const updateOrder = async (orderId: string, updateData: Partial<Order>) => {
  const orderRef = doc(db, 'orders', orderId);
  const updatePayload = {
    ...updateData,
    UpdatedAt: new Date().toISOString()
  };
  
  await updateDoc(orderRef, updatePayload);
  return updatePayload;
};

export const deleteOrder = async (orderId: string) => {
  const orderRef = doc(db, 'orders', orderId);
  await deleteDoc(orderRef);
};

// Users CRUD operations
export const getUsers = async () => {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Normalize to consistent field names
    return {
      ID: doc.id,
      Name: data.Name || data.name || '',
      Email: data.Email || data.email || '',
      Number: data.Number || data.number || '',
      Status: data.Status || data.status || 'Non-Verified',
      Role: data.Role || data.role || 'Moderator',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    } as User;
  });
};

export const updateUserStatus = async (userId: string, status: 'Verified' | 'Non-Verified') => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { 
    Status: status,
    updatedAt: new Date().toISOString()
  });
};

export const updateUserRole = async (userId: string, role: 'Admin' | 'Moderator') => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { 
    Role: role,
    updatedAt: new Date().toISOString()
  });
};

export const deleteUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  await deleteDoc(userRef);
};
