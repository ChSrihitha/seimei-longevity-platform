export const USERS_STORAGE_KEY = 'seimei_users';
export const CURRENT_USER_STORAGE_KEY = 'seimei_current_user';
export const AUTH_STORAGE_KEY = CURRENT_USER_STORAGE_KEY;

const LEGACY_SESSION_KEY = 'seimei_auth';
const HASH_ITERATIONS = 120_000;
const DEMO_EMAIL = 'sarah.johnson@example.com';
const DEMO_PASSWORD = 'seimei123';
export const ADMIN_DEMO_CREDENTIALS = {
  email: 'keerti.admin@example.com',
  password: 'seimei-admin-demo',
} as const;
const ADMIN_USER_ID = 'demo-seimei-admin';

export type EmployeeAccount = {
  id: string;
  fullName: string;
  email: string;
  accountType: 'employee';
  role: string;
  department?: string;
  createdAt: string;
  passwordSalt: string;
  passwordHash: string;
};

export type AuthenticatedUser = Omit<EmployeeAccount, 'passwordSalt' | 'passwordHash'> | {
  id: typeof ADMIN_USER_ID;
  fullName: 'Keerti Admin';
  email: typeof ADMIN_DEMO_CREDENTIALS.email;
  accountType: 'admin';
  role: 'Administrator';
  createdAt: string;
};

export type RegistrationInput = {
  fullName: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
};

type LegacyEmployee = {
  id?: unknown;
  name?: unknown;
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
  passwordSalt?: unknown;
  passwordHash?: unknown;
  role?: unknown;
  department?: unknown;
  createdAt?: unknown;
};

const encoder = new TextEncoder();
let employeesPromise: Promise<EmployeeAccount[]> | undefined;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function createSalt(): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations: HASH_ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(derived));
}

function createId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `employee-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function saveEmployees(employees: EmployeeAccount[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(employees));
}

async function migrateEmployee(value: unknown): Promise<EmployeeAccount | null> {
  if (typeof value !== 'object' || value === null) return null;
  const employee = value as LegacyEmployee;
  if (typeof employee.email !== 'string') return null;

  const email = normalizeEmail(employee.email);
  const fullName = typeof employee.fullName === 'string'
    ? employee.fullName
    : typeof employee.name === 'string' ? employee.name : '';
  const id = typeof employee.id === 'string' ? employee.id : createId();
  const role = typeof employee.role === 'string' && employee.role.trim() ? employee.role : 'Employee';
  const department = typeof employee.department === 'string' ? employee.department : undefined;
  const createdAt = typeof employee.createdAt === 'string' ? employee.createdAt : new Date().toISOString();

  if (typeof employee.passwordSalt === 'string' && typeof employee.passwordHash === 'string') {
    return { id, fullName, email, accountType: 'employee', role, department, createdAt, passwordSalt: employee.passwordSalt, passwordHash: employee.passwordHash };
  }

  if (typeof employee.password !== 'string') return null;
  const passwordSalt = createSalt();
  const passwordHash = await hashPassword(employee.password, passwordSalt);
  return { id, fullName, email, accountType: 'employee', role, department, createdAt, passwordSalt, passwordHash };
}

async function loadEmployees(): Promise<EmployeeAccount[]> {
  const serialized = localStorage.getItem(USERS_STORAGE_KEY);
  const values: unknown[] = serialized ? JSON.parse(serialized) as unknown[] : [];
  const migrated: EmployeeAccount[] = [];

  for (const value of values) {
    const employee = await migrateEmployee(value);
    if (employee && !migrated.some((existing) => existing.email === employee.email)) migrated.push(employee);
  }

  if (!migrated.some((employee) => employee.email === DEMO_EMAIL)) {
    const passwordSalt = createSalt();
    migrated.unshift({
      id: 'demo-sarah-johnson',
      fullName: 'Sarah Johnson',
      email: DEMO_EMAIL,
      accountType: 'employee',
      role: 'Marketing Manager',
      department: 'Marketing',
      createdAt: '2026-01-01T00:00:00.000Z',
      passwordSalt,
      passwordHash: await hashPassword(DEMO_PASSWORD, passwordSalt),
    });
  }

  saveEmployees(migrated);
  return migrated;
}

export function initializeAuth(): Promise<EmployeeAccount[]> {
  if (!employeesPromise) {
    employeesPromise = loadEmployees().catch((error: unknown) => {
      employeesPromise = undefined;
      throw error;
    });
  }
  return employeesPromise;
}

export async function isEmailRegistered(email: string): Promise<boolean> {
  const employees = await initializeAuth();
  const normalized = normalizeEmail(email);
  return employees.some((employee) => employee.email === normalized);
}

function toAuthenticatedUser(employee: EmployeeAccount): AuthenticatedUser {
  const { passwordSalt: _passwordSalt, passwordHash: _passwordHash, ...user } = employee;
  return user;
}

function saveCurrentUser(user: AuthenticatedUser): void {
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
}

function isAuthenticatedUser(value: unknown): value is AuthenticatedUser {
  if (typeof value !== 'object' || value === null || !('accountType' in value)) return false;
  if (value.accountType === 'admin') {
    return 'id' in value && value.id === ADMIN_USER_ID &&
      'email' in value && value.email === ADMIN_DEMO_CREDENTIALS.email &&
      'fullName' in value && value.fullName === 'Keerti Admin' &&
      'role' in value && value.role === 'Administrator' &&
      'createdAt' in value && typeof value.createdAt === 'string';
  }
  return value.accountType === 'employee' &&
    'id' in value && typeof value.id === 'string' &&
    'fullName' in value && typeof value.fullName === 'string' &&
    'email' in value && typeof value.email === 'string' &&
    'role' in value && typeof value.role === 'string' &&
    'createdAt' in value && typeof value.createdAt === 'string';
}

export function getCurrentUser(): AuthenticatedUser | null {
  const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (storedUser) {
    try {
      const user: unknown = JSON.parse(storedUser);
      return isAuthenticatedUser(user) ? user : null;
    } catch {
      return null;
    }
  }

  const oldSession = localStorage.getItem(LEGACY_SESSION_KEY);
  if (!oldSession) return null;
  try {
    const parsed: unknown = JSON.parse(oldSession);
    const legacy = typeof parsed === 'object' && parsed !== null && 'user' in parsed ? parsed.user : parsed;
    if (typeof legacy !== 'object' || legacy === null || !('email' in legacy) || typeof legacy.email !== 'string') return null;
    const name = 'fullName' in legacy && typeof legacy.fullName === 'string'
      ? legacy.fullName
      : 'name' in legacy && typeof legacy.name === 'string' ? legacy.name : legacy.email;
    const user: AuthenticatedUser = {
      id: 'id' in legacy && typeof legacy.id === 'string' ? legacy.id : `legacy-${normalizeEmail(legacy.email)}`,
      fullName: name,
      email: normalizeEmail(legacy.email),
      accountType: 'employee',
      role: 'role' in legacy && typeof legacy.role === 'string' ? legacy.role : 'Employee',
      ...('department' in legacy && typeof legacy.department === 'string' ? { department: legacy.department } : {}),
      createdAt: 'createdAt' in legacy && typeof legacy.createdAt === 'string' ? legacy.createdAt : new Date().toISOString(),
    };
    saveCurrentUser(user);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    return user;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export async function signIn(email: string, password: string): Promise<AuthenticatedUser | null> {
  const employees = await initializeAuth();
  const employee = employees.find((candidate) => candidate.email === normalizeEmail(email));
  if (!employee) return null;

  const candidateHash = await hashPassword(password, employee.passwordSalt);
  if (candidateHash !== employee.passwordHash) return null;

  const user = toAuthenticatedUser(employee);
  saveCurrentUser(user);
  return user;
}

export async function signInAdmin(email: string, password: string): Promise<AuthenticatedUser | null> {
  if (normalizeEmail(email) !== ADMIN_DEMO_CREDENTIALS.email || password !== ADMIN_DEMO_CREDENTIALS.password) return null;

  const user: AuthenticatedUser = {
    id: ADMIN_USER_ID,
    fullName: 'Keerti Admin',
    email: ADMIN_DEMO_CREDENTIALS.email,
    accountType: 'admin',
    role: 'Administrator',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
  saveCurrentUser(user);
  return user;
}

export function isAdminUser(user: AuthenticatedUser | null): user is Extract<AuthenticatedUser, { accountType: 'admin' }> {
  return user?.accountType === 'admin' &&
    user.email === ADMIN_DEMO_CREDENTIALS.email &&
    user.id === ADMIN_USER_ID;
}

export const login = signIn;
export const authenticate = signIn;

export async function signUp(input: RegistrationInput): Promise<{ user: AuthenticatedUser } | { error: 'duplicate-email' }> {
  const employees = await initializeAuth();
  const email = normalizeEmail(input.email);
  if (employees.some((employee) => employee.email === email)) return { error: 'duplicate-email' };

  const passwordSalt = createSalt();
  const employee: EmployeeAccount = {
    id: createId(),
    fullName: input.fullName.trim(),
    email,
    accountType: 'employee',
    role: input.role?.trim() || 'Employee',
    ...(input.department?.trim() ? { department: input.department.trim() } : {}),
    createdAt: new Date().toISOString(),
    passwordSalt,
    passwordHash: await hashPassword(input.password, passwordSalt),
  };
  employees.push(employee);
  saveEmployees(employees);

  const user = toAuthenticatedUser(employee);
  saveCurrentUser(user);
  return { user };
}

export const register = signUp;

export function signOut(): void {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  localStorage.removeItem(LEGACY_SESSION_KEY);
}

export const clearAuthentication = signOut;
export const getAuthenticatedUser = getCurrentUser;
