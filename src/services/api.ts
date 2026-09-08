import axios from "@/utils/Axios";

export interface IPost {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  imageUrl?: string;
  isAvailable: boolean;
  isApproved: boolean;
  type?: string;
  seller: {
    id: string;
    image: string;
    name: string;
    email: string;
    college: string;
    phoneNo: string;
  };
  category: string;
  feedback?: {
    id: string;
    postId: string;
    customerId: string;
    rating: number;
    text: string | null;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IUserProfile {
  id: string;
  image: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  phoneNo: string;
  posts: IPost[];
  requests: IUserRequest[];
  purchasedItems: IPost[];
}

export interface IUserRequest {
  id: string;
  title: string;
  description: string;
  image: string;
  isApproved: boolean;
  userId: string;
  createdAt: string;
  user: {
    image: string;
    name: string;
    email: string;
    college: string;
    phoneNo: string;
  };
  _count: {
    upVotes: number;
  };
}

// Normalize a raw product from backend to IPost shape
const normalizeProduct = (p: any): IPost => ({
  ...p,
  images: p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : [],
  isAvailable: p.status === "AVAILABLE" || p.isAvailable === true,
  isApproved: p.isApproved !== false,
  seller: p.seller || {
    id: p.owner?.id || "",
    name: p.owner?.name || "",
    email: p.owner?.email || "",
    college: p.owner?.college || "",
    phoneNo: p.owner?.phone || "",
    image: p.owner?.profileImage || "",
  },
});

export const fetchPosts = async (): Promise<{ success?: IPost[]; error?: string }> => {
  try {
    const response = await axios.get("/products");
    if (response.status === 200) {
      return { success: (response.data.products || []).map(normalizeProduct) };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch posts" };
  }
  return { error: "Unknown error" };
};

export const fetchPost = async (postId: string): Promise<{ success?: IPost; error?: string }> => {
  try {
    const response = await axios.get(`/products/${postId}`);
    if (response.status === 200) {
      return { success: normalizeProduct(response.data.product) };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch post" };
  }
  return { error: "Unknown error" };
};

export const fetchFilteredPosts = async (category: string, query?: string): Promise<{ success?: IPost[]; error?: string }> => {
  try {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "all") params.set("category", category);
    const response = await axios.get(`/products/filters?${params.toString()}`);
    if (response.status === 200) {
      return { success: (response.data.products || []).map(normalizeProduct) };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch posts" };
  }
  return { error: "Unknown error" };
};

export interface CreatePostData {
  title: string;
  description: string;
  price: string;
  category: string;
  images: string[];
  type?: string;
}

export const createPost = async (data: CreatePostData): Promise<{ success?: string; error?: string }> => {
  try {
    const payload = {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      type: data.type || "SELL",
      imageUrl: data.images[0] || null,
    };
    const response = await axios.post("/products", payload);
    if (response.status === 201) {
      return { success: response.data.message };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to create post" };
  }
  return { error: "Unknown error" };
};

export const updatePost = async (postId: string, data: Partial<CreatePostData>): Promise<{ success?: string; error?: string }> => {
  try {
    const response = await axios.put(`/products/${postId}`, data);
    if (response.status === 200) {
      return { success: response.data.message };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to update post" };
  }
  return { error: "Unknown error" };
};

export const markPostSold = async (postId: string, buyerId: string): Promise<{ success?: string; error?: string }> => {
  try {
    const response = await axios.patch(`/products/${postId}/sold`, { buyerId });
    if (response.status === 200) {
      return { success: response.data.message };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to mark as sold" };
  }
  return { error: "Unknown error" };
};

export const deletePost = async (postId: string): Promise<{ success?: string; error?: string }> => {
  try {
    const response = await axios.delete(`/products/${postId}`);
    if (response.status === 200) {
      return { success: response.data.message };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to delete post" };
  }
  return { error: "Unknown error" };
};

export const fetchUserProfile = async (): Promise<{ success?: IUserProfile; error?: string }> => {
  try {
    const response = await axios.get("/user/profile");
    if (response.status === 200) {
      const data = response.data;
      return {
        success: {
          id: data.id,
          name: data.name,
          email: data.email,
          college: data.college,
          branch: data.branch || "",
          year: data.year || "",
          phoneNo: data.phone || data.phoneNo || "",
          image: data.profileImage || data.image || "",
          posts: (data.posts || []).map(normalizeProduct),
          requests: data.requests || [],
          purchasedItems: (data.purchasedItems || []).map(normalizeProduct),
        },
      };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch profile" };
  }
  return { error: "Unknown error" };
};

export const updateUserProfile = async (data: Partial<{
  name: string;
  phoneNo: string;
  college: string;
  branch: string;
  year: string;
  image: string;
}>): Promise<{ success?: string; error?: string }> => {
  try {
    const response = await axios.patch("/user/profile", data);
    if (response.status === 200) {
      return { success: response.data.message };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to update profile" };
  }
  return { error: "Unknown error" };
};

export const fetchUserRequests = async (): Promise<{ success?: IUserRequest[]; error?: string }> => {
  try {
    const response = await axios.get("/requests");
    if (response.status === 200) {
      return { success: response.data.requests };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to fetch requests" };
  }
  return { error: "Unknown error" };
};

export const createUserRequest = async (data: { productId: string; totalAmount: number; message?: string; platformFee?: number }): Promise<{ success?: string; error?: string }> => {
  try {
    const response = await axios.post("/requests", data);
    if (response.status === 201) {
      return { success: response.data.message };
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } } };
    return { error: err.response?.data?.message || err.response?.data?.error || "Failed to create request" };
  }
  return { error: "Unknown error" };
};
