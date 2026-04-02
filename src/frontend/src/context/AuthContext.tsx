import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Role = "patient" | "doctor" | "hospital" | "admin" | null;

interface AuthState {
  role: Role;
  patientId: bigint | null;
  doctorId: bigint | null;
  hospitalId: bigint | null;
  patientName: string;
  phone: string;
  adminAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    role: "patient" | "doctor" | "hospital",
    id: bigint,
    name: string,
    phone: string,
  ) => void;
  loginAdmin: () => void;
  logout: () => void;
}

const defaultState: AuthState = {
  role: null,
  patientId: null,
  doctorId: null,
  hospitalId: null,
  patientName: "",
  phone: "",
  adminAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>({
  ...defaultState,
  login: () => {},
  loginAdmin: () => {},
  logout: () => {},
});

const STORAGE_KEY = "mediconnect_auth";

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as {
      role: Role;
      patientId: string | null;
      doctorId: string | null;
      hospitalId: string | null;
      patientName: string;
      phone: string;
      adminAuthenticated?: boolean;
    };
    return {
      role: parsed.role,
      patientId: parsed.patientId ? BigInt(parsed.patientId) : null,
      doctorId: parsed.doctorId ? BigInt(parsed.doctorId) : null,
      hospitalId: parsed.hospitalId ? BigInt(parsed.hospitalId) : null,
      patientName: parsed.patientName || "",
      phone: parsed.phone || "",
      adminAuthenticated: parsed.adminAuthenticated ?? false,
    };
  } catch {
    return defaultState;
  }
}

function saveToStorage(state: AuthState): void {
  try {
    const serialized = {
      role: state.role,
      patientId: state.patientId?.toString() ?? null,
      doctorId: state.doctorId?.toString() ?? null,
      hospitalId: state.hospitalId?.toString() ?? null,
      patientName: state.patientName,
      phone: state.phone,
      adminAuthenticated: state.adminAuthenticated,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(loadFromStorage);

  useEffect(() => {
    saveToStorage(auth);
  }, [auth]);

  const login = (
    role: "patient" | "doctor" | "hospital",
    id: bigint,
    name: string,
    phone: string,
  ) => {
    const newState: AuthState = {
      role,
      patientId: role === "patient" ? id : null,
      doctorId: role === "doctor" ? id : null,
      hospitalId: role === "hospital" ? id : null,
      patientName: name,
      phone,
      adminAuthenticated: false,
    };
    setAuth(newState);
  };

  const loginAdmin = () => {
    const newState: AuthState = {
      role: "admin",
      patientId: null,
      doctorId: null,
      hospitalId: null,
      patientName: "Admin",
      phone: "",
      adminAuthenticated: true,
    };
    setAuth(newState);
  };

  const logout = () => {
    setAuth(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
