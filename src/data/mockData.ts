import {
  WarehouseItem,
  Visit,
  User,
  ActivityLogEntry,
} from "@/types";

export const initialWarehouseItems: WarehouseItem[] = [];

export const initialVisits: Visit[] = [];

export const initialUsers: User[] = [
  { id: "user-1", name: "abnmazin", role: "developer", pin: "077077", active: true },
];

export const initialActivityLog: ActivityLogEntry[] = [];
