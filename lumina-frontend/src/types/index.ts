export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  isVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  price: number | string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  enrollmentCount?: number;
  Instructor?: {
    id: string;
    name: string;
    email: string;
  };
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string | null;
  video_url: string | null;
  order_index: number;
  createdAt: string;
  updatedAt: string;
  Course?: Course;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  completed_lesson_ids: string[];
  createdAt: string;
  course?: {
    id: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
  };
}

export interface Conversation {
  id: string;
  type: 'room' | 'dm';
  course_id?: string | null;
  participants: string[];
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    thumbnail_url?: string | null;
  };
  recipient?: User | null;
  lastMessage?: {
    id: string;
    text: string;
    sender_id: string;
    createdAt: string;
  } | null;
  unreadCount?: number;
}

export interface MessageSender {
  id: string;
  name: string;
  avatar_url?: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  sender?: MessageSender;
}

export interface PaginationMeta {
  totalCourses: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PublicCoursesData {
  courses: Course[];
  enrolledCourseIds: string[];
  pagination: PaginationMeta;
}

export interface ChatHistoryData {
  messages: Message[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface MyConversationsData {
  courseRooms: Conversation[];
  dms: Conversation[];
}

export interface InstructorStatsData {
  totalEarnings: number;
  totalCoursesSold: number;
  recentSales: {
    courseTitle: string;
    date: string;
    username: string;
    amount: number;
  }[];
}

export interface BankDetailsData {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  paystack_subaccount_code: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
}
