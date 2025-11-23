import { MenuItem, Topping } from './types';

export const MENU_CATEGORIES = ["找好茶", "找奶茶", "找拿鐵", "找口感", "找新鮮"];

export const SUGAR_OPTIONS = ["正常糖", "少糖 (7分)", "半糖 (5分)", "微糖 (3分)", "無糖"];
export const ICE_OPTIONS = ["正常冰", "少冰", "微冰", "去冰", "完全去冰", "溫", "熱"];
export const TOPPINGS: Topping[] = [{ name: "波霸" }, { name: "珍珠" }, { name: "椰果" }, { name: "燕麥" }];

export const LOCAL_STORAGE_KEY = "fifty_lan_local_orders";
export const USERNAME_STORAGE_KEY = "fifty_lan_username";

export const MENU_ITEMS: MenuItem[] = [
  { id: 101, name: "茉莉綠茶", category: "找好茶", priceM: 30, priceL: 35 },
  { id: 102, name: "阿薩姆紅茶", category: "找好茶", priceM: 30, priceL: 35 },
  { id: 103, name: "四季春青茶", category: "找好茶", priceM: 30, priceL: 35 },
  { id: 104, name: "黃金烏龍", category: "找好茶", priceM: 30, priceL: 35 },
  { id: 201, name: "奶茶", category: "找奶茶", priceM: 50, priceL: 60 },
  { id: 202, name: "奶綠", category: "找奶茶", priceM: 50, priceL: 60 },
  { id: 203, name: "烏龍奶茶", category: "找奶茶", priceM: 50, priceL: 60 },
  { id: 204, name: "阿華田", category: "找奶茶", priceM: 50, priceL: 65 },
  { id: 205, name: "可可芭蕾", category: "找奶茶", priceM: 60, priceL: 75 },
  { id: 301, name: "紅茶拿鐵", category: "找拿鐵", priceM: 60, priceL: 75 },
  { id: 302, name: "綠茶拿鐵", category: "找拿鐵", priceM: 60, priceL: 75 },
  { id: 303, name: "烏龍拿鐵", category: "找拿鐵", priceM: 60, priceL: 75 },
  { id: 401, name: "波霸奶茶", category: "找口感", priceM: 50, priceL: 60 },
  { id: 402, name: "珍珠奶茶", category: "找口感", priceM: 50, priceL: 60 },
  { id: 403, name: "燕麥奶茶", category: "找口感", priceM: 50, priceL: 60 },
  { id: 404, name: "椰果奶茶", category: "找口感", priceM: 50, priceL: 60 },
  { id: 405, name: "布丁奶茶", category: "找口感", priceM: 60, priceL: 70 },
  { id: 406, name: "冰淇淋紅茶", category: "找口感", priceM: 50, priceL: 60 },
  { id: 407, name: "1號 (四季春+珍波椰)", category: "找口感", priceM: 40, priceL: 50 },
  { id: 501, name: "檸檬綠", category: "找新鮮", priceM: 50, priceL: 60 },
  { id: 502, name: "梅子綠", category: "找新鮮", priceM: 50, priceL: 60 },
  { id: 503, name: "金桔檸檬", category: "找新鮮", priceM: 50, priceL: 60 },
  { id: 504, name: "8冰綠", category: "找新鮮", priceM: 50, priceL: 60 },
  { id: 505, name: "旺來紅", category: "找新鮮", priceM: 50, priceL: 60 },
];