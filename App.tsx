import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  ClipboardList, 
  Coffee, 
  X, 
  BarChart3, 
  User, 
  RefreshCw, 
  AlertTriangle,
  Check,
  Smile,
  Zap
} from 'lucide-react';
import { MenuItem, CartItem, GroupedItem } from './types';
import { 
  MENU_CATEGORIES, 
  MENU_ITEMS, 
  SUGAR_OPTIONS, 
  ICE_OPTIONS, 
  TOPPINGS, 
  LOCAL_STORAGE_KEY, 
  USERNAME_STORAGE_KEY 
} from './constants';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'stats'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>("找好茶");
  const [cart, setCart] = useState<CartItem[]>([]); 
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add Item Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<MenuItem | null>(null);
  const [orderName, setOrderName] = useState<string>("");
  const [size, setSize] = useState<string>("L");
  const [sugar, setSugar] = useState<string>("半糖 (5分)");
  const [ice, setIce] = useState<string>("少冰");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  // Delete Single Item Modal State
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null);

  // Clear All Modal State
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  // --- Effects ---

  // Load Data
  useEffect(() => {
    const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCart) {
      try {
        const loadedCart = JSON.parse(savedCart).map((item: any) => ({ 
          ...item, 
          // Ensure every item has a unique ID upon load
          cartId: item.cartId || Math.random().toString(36).substring(2, 9) 
        }));
        setCart(loadedCart);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoading(false);
  }, []);

  // --- Helper Functions ---

  const saveCartToLocalStorage = (newCart: CartItem[]) => {
    // Sort by newest first
    const sortedCart = [...newCart].sort((a, b) => b.createdAt - a.createdAt);
    setCart(sortedCart);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sortedCart));
  };

  const openModal = (item: MenuItem) => {
    setCurrentItem(item);
    const savedName = localStorage.getItem(USERNAME_STORAGE_KEY) || "";
    setOrderName(savedName);
    setSize("L");
    setSugar("半糖 (5分)");
    setIce("少冰");
    setSelectedToppings([]);
    setIsModalOpen(true);
  };

  const toggleTopping = (t: string) => {
    if (selectedToppings.includes(t)) {
      setSelectedToppings(prev => prev.filter(x => x !== t));
    } else {
      setSelectedToppings(prev => [...prev, t]);
    }
  };

  const addToCartLocal = () => {
    if (!currentItem) return;

    const basePrice = size === "M" ? currentItem.priceM : currentItem.priceL;
    const finalPrice = basePrice + (selectedToppings.length * 10);
    const finalName = orderName.trim() || "匿名";
    localStorage.setItem(USERNAME_STORAGE_KEY, finalName);

    const newItem: CartItem = {
      cartId: Math.random().toString(36).substring(2, 9),
      id: currentItem.id,
      name: currentItem.name,
      userName: finalName,
      size,
      sugar,
      ice,
      toppings: selectedToppings,
      price: finalPrice,
      createdAt: Date.now(),
    };

    saveCartToLocalStorage([...cart, newItem]);
    setIsModalOpen(false);
    // Optional: Stay on menu for faster ordering on desktop
    // setActiveTab('cart'); 
  };

  const confirmDelete = (item: CartItem) => {
    setItemToDelete(item);
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    const newCart = cart.filter(item => item.cartId !== itemToDelete.cartId);
    saveCartToLocalStorage(newCart);
    setItemToDelete(null);
  };

  const handleConfirmClearAll = () => {
    saveCartToLocalStorage([]);
    setIsClearModalOpen(false);
  };

  // --- Statistics Logic ---
  
  const groupedItems: GroupedItem[] = useMemo(() => {
    const groups: Record<string, GroupedItem> = {};
    cart.forEach(item => {
      const toppingsStr = item.toppings.length > 0 ? ` +${item.toppings.join(',')}` : '';
      // Grouping key includes user name to separate individual orders exactly
      const key = `${item.name} (${item.size}/${item.sugar}/${item.ice}${toppingsStr}) by ${item.userName}`;
      
      if (!groups[key]) {
        groups[key] = { 
          name: item.name, 
          details: `${item.size} / ${item.sugar} / ${item.ice}${toppingsStr}`, 
          count: 0, 
          subtotal: 0, 
          users: [] 
        };
      }
      groups[key].count += 1;
      groups[key].subtotal += item.price;
      groups[key].users.push(item.userName);
    });
    return Object.values(groups);
  }, [cart]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const copyOrderList = () => {
    const header = "【築愛同學 喝飲料囉 - 50嵐 訂單】\n";
    const orderList = groupedItems.map(g => {
      const userList = g.users.join('、');
      return `▶ ${g.name} ${g.details} x${g.count}\n  (${userList})`;
    }).join('\n\n');

    const footer = `\n\n- 總計: ${cart.length} 杯 / $${cartTotal} -`;
    const docText = header + orderList + footer;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(docText)
        .then(() => alert("訂單清單已複製！請貼到群組中。"))
        .catch(() => alert("複製失敗，請手動截圖。"));
    } else {
      alert("您的瀏覽器不支援自動複製，請手動截圖。");
    }
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-sky-50 font-sans text-gray-800">
      
      {/* Header - Desktop Style */}
      <header className="bg-sky-400 shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('menu')}>
            <div className="bg-white text-sky-500 rounded-xl font-bold text-xl w-10 h-10 flex items-center justify-center shadow-sm rotate-3 transform transition-transform hover:rotate-6">
              <Smile size={24} strokeWidth={2.5} />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-bold leading-tight tracking-wide">築愛同學</h1>
              <div className="text-xs text-sky-100 font-medium opacity-90">
                 喝飲料囉-50嵐
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex bg-sky-500/30 p-1 rounded-xl backdrop-blur-sm border border-white/10">
            {[
              { id: 'menu', icon: Coffee, label: '菜單' },
              { id: 'cart', icon: ShoppingCart, label: '訂單' },
              { id: 'stats', icon: BarChart3, label: '總計' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-sky-500 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <tab.icon size={18} strokeWidth={2.5} />
                {tab.label}
                {tab.id === 'cart' && cart.length > 0 && (
                  <span className="bg-sky-600 text-white text-[10px] px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center ml-1">
                    {cart.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Mobile/Tablet Right Section */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setActiveTab('cart')}
              className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                 <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white font-bold">
                   {cart.length}
                 </span>
              )}
            </button>
          </div>

          {/* Desktop Total Indicator */}
          <div className="hidden md:block text-sm font-bold bg-white/20 px-4 py-2 rounded-full border border-white/40 text-white backdrop-blur-sm">
             ${cartTotal} <span className="opacity-60 mx-1">/</span> {cart.length}杯
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar (Only visible on small screens) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 px-2">
          <button 
            onClick={() => setActiveTab('menu')} 
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${activeTab === 'menu' ? 'text-sky-500' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            {activeTab === 'menu' ? <Coffee size={24} strokeWidth={2.5} /> : <Coffee size={24} strokeWidth={2} />}
            <span className={`text-[10px] mt-1 font-medium ${activeTab === 'menu' ? 'font-bold' : ''}`}>點餐</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('cart')} 
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg transition-colors relative ${activeTab === 'cart' ? 'text-sky-500' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <div className="relative">
              {activeTab === 'cart' ? <ShoppingCart size={24} strokeWidth={2.5} /> : <ShoppingCart size={24} strokeWidth={2} />}
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-sky-500 text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 border border-white font-bold shadow-sm">
                  {cart.length}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${activeTab === 'cart' ? 'font-bold' : ''}`}>清單</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${activeTab === 'stats' ? 'text-sky-500' : 'text-gray-400 hover:bg-gray-50'}`}
          >
             {activeTab === 'stats' ? <BarChart3 size={24} strokeWidth={2.5} /> : <BarChart3 size={24} strokeWidth={2} />}
            <span className={`text-[10px] mt-1 font-medium ${activeTab === 'stats' ? 'font-bold' : ''}`}>總計</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
        {isLoading && (
          <div className="text-center py-20">
            <RefreshCw className="animate-spin mx-auto text-sky-400 mb-3" size={32}/>
            <p className="text-gray-400 font-medium">載入菜單中...</p>
          </div>
        )}

        {/* --- MENU TAB --- */}
        {!isLoading && activeTab === 'menu' && (
          <div className="animate-fade-in space-y-6">
            {/* Category Filter */}
             <div className="flex flex-wrap gap-2 pb-2 justify-center md:justify-start">
              {MENU_CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 border-2 shadow-sm hover:shadow-md ${
                    selectedCategory === cat 
                      ? 'bg-sky-400 text-white border-sky-400 transform scale-105' 
                      : 'bg-white text-gray-500 border-sky-50 hover:bg-sky-50 hover:text-sky-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {MENU_ITEMS.filter(i => i.category === selectedCategory).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => openModal(item)} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-sky-100 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group h-full"
                >
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-700 group-hover:text-sky-600 transition-colors">{item.name}</h3>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1.5">
                       <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">中杯 ${item.priceM}</span>
                       <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">大杯 ${item.priceL}</span>
                    </div>
                    <button className="bg-sky-50 text-sky-400 w-10 h-10 rounded-full flex items-center justify-center border-2 border-sky-100 group-hover:bg-sky-400 group-hover:text-white group-hover:border-sky-400 transition-all shadow-sm">
                      <Plus size={22} strokeWidth={3}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CART TAB --- */}
        {!isLoading && activeTab === 'cart' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-sky-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Coffee className="text-sky-500" size={24} /> 我的訂單
                </h2>
                <p className="text-sm text-gray-400 mt-1 font-medium">訂單儲存在您的裝置中</p>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={() => setIsClearModalOpen(true)} 
                  className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-2 rounded-full hover:bg-red-100 transition-colors flex items-center gap-2 font-bold"
                >
                  <Trash2 size={16} /> 清空
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-gray-400 opacity-60 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-sky-100 p-6 rounded-full mb-4 text-sky-300">
                  <Smile size={48} strokeWidth={2} />
                </div>
                <p className="font-bold text-gray-400 text-lg">還沒有飲料喔</p>
                <p className="text-sm mt-1">今天想喝點什麼呢？</p>
                <button onClick={() => setActiveTab('menu')} className="mt-6 text-sky-500 font-bold text-sm bg-white border-2 border-sky-100 px-8 py-3 rounded-full shadow-sm hover:bg-sky-50 transition-all hover:scale-105">去點餐 &rarr;</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cart.map((item) => (
                  <div 
                    key={item.cartId} 
                    className="bg-white p-5 rounded-2xl shadow-sm border border-sky-100 relative overflow-hidden group hover:shadow-md transition-all"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-400 group-hover:w-2 transition-all"></div>
                    <div className="flex justify-between items-start pl-3">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-sky-100 text-sky-600 text-xs font-bold px-2 py-1 rounded-md">
                            {item.userName}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2">{item.name}</h3>
                        <div className="text-sm text-gray-500 flex flex-wrap gap-1.5">
                          <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">{item.size}</span>
                          <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">{item.sugar}</span>
                          <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">{item.ice}</span>
                          {item.toppings.length > 0 && (
                            <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded font-bold">
                              +{item.toppings.join(',')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 justify-between h-full">
                        <div className="font-bold text-gray-800 text-xl">${item.price}</div>
                        <button 
                          onClick={() => confirmDelete(item)} 
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                          title="刪除"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- STATS TAB --- */}
        {!isLoading && activeTab === 'stats' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Summary Card */}
             <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-sky-400 to-cyan-400 rounded-2xl p-8 text-white shadow-lg shadow-sky-200 relative overflow-hidden sticky top-24">
                  <div className="absolute top-[-20px] right-[-20px] bg-white/10 w-40 h-40 rounded-full blur-2xl"></div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <h2 className="text-3xl font-bold flex items-center gap-2">訂單彙整</h2>
                      <p className="text-sky-50 text-base opacity-90 font-medium mt-1">準備發到群組囉！</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-xl">
                      <ClipboardList className="text-white" size={32} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                      <div className="text-xs text-sky-100 uppercase tracking-wider font-bold opacity-80 mb-1">總杯數</div>
                      <div className="text-4xl font-bold">{cart.length}</div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                      <div className="text-xs text-sky-100 uppercase tracking-wider font-bold opacity-80 mb-1">總金額</div>
                      <div className="text-4xl font-bold">${cartTotal}</div>
                    </div>
                  </div>

                  <button 
                    onClick={copyOrderList}
                    className="w-full bg-white text-sky-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-sky-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md text-lg"
                  >
                    <ClipboardList size={20} /> 複製文字清單
                  </button>
               </div>
             </div>

            {/* Details List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-sky-100">
                <div className="bg-sky-50 px-6 py-4 border-b border-sky-100 font-bold text-sky-700 flex justify-between items-center">
                  <span className="flex items-center gap-2"><BarChart3 size={18}/> 品項明細</span>
                  <span className="text-xs bg-white px-2 py-1 rounded border border-sky-100 text-sky-500">共 {groupedItems.length} 種飲品</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {groupedItems.length === 0 ? (
                     <div className="p-10 text-center text-gray-400">
                        暫無訂單資料
                     </div>
                  ) : groupedItems.map((g, idx) => (
                    <div key={idx} className="p-6 flex justify-between items-start hover:bg-sky-50/30 transition-colors group">
                      <div className="flex-1 pr-8">
                        <div className="flex items-baseline gap-2">
                          <div className="font-bold text-gray-800 text-lg">{g.name}</div>
                          <div className="text-sm text-gray-400">{g.details}</div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {g.users.map((u, i) => (
                            <span key={i} className="bg-sky-100 text-sky-700 text-xs px-2.5 py-1 rounded-md font-bold border border-sky-200">
                              {u}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <div className="font-bold text-sky-500 text-2xl">x{g.count}</div>
                        <div className="text-sm text-gray-400 font-medium mt-1">${g.subtotal}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Add Item Modal (Centered Dialog Style) */}
      {isModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-sky-50 flex justify-between items-center shrink-0 border-b border-sky-100">
              <h2 className="font-bold text-sky-900 text-xl flex items-center gap-2">
                 <div className="bg-white p-1.5 rounded-full shadow-sm"><Zap size={20} className="text-yellow-400 fill-yellow-400" /></div>
                 {currentItem.name}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="bg-white p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors text-gray-400 border border-gray-100 shadow-sm"
              >
                <X size={20}/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 overscroll-contain custom-scrollbar">
              
              {/* Name Input */}
              <div className="animate-fade-in" style={{animationDelay: '0ms'}}>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">訂購人 (必填)</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-sky-500 transition-colors" size={20}/>
                  <input 
                    type="text"
                    value={orderName} 
                    onChange={(e) => setOrderName(e.target.value)} 
                    placeholder="請輸入您的名字..." 
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none bg-gray-50 focus:bg-white font-bold text-gray-800 transition-all placeholder:font-normal text-lg"
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Size Selection */}
                <div className="animate-fade-in" style={{animationDelay: '50ms'}}>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">尺寸</label>
                  <div className="flex flex-col gap-2">
                    {['M', 'L'].map(s => {
                      const isActive = size === s;
                      const price = s === 'M' ? currentItem.priceM : currentItem.priceL;
                      return (
                        <button 
                          key={s} 
                          onClick={() => setSize(s)} 
                          className={`flex-1 py-3 px-4 rounded-xl border-2 text-left transition-all relative ${
                            isActive 
                              ? 'bg-sky-50 border-sky-400 text-sky-800' 
                              : 'border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold">{s === 'M' ? '中杯' : '大杯'}</span>
                            <span className="text-sm font-medium opacity-70">${price}</span>
                          </div>
                          {isActive && <div className="absolute top-3 right-3 text-sky-500"><Check size={18} strokeWidth={3}/></div>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                 {/* Toppings */}
                <div className="animate-fade-in" style={{animationDelay: '100ms'}}>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">加料 (+$10)</label>
                  <div className="flex flex-wrap gap-2">
                    {TOPPINGS.map(t => {
                      const isSelected = selectedToppings.includes(t.name);
                      return (
                        <button 
                          key={t.name} 
                          onClick={() => toggleTopping(t.name)} 
                          className={`px-3 py-2 rounded-lg text-sm border-2 font-bold transition-all flex items-center gap-1 grow justify-center ${
                            isSelected 
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm' 
                              : 'border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                           {t.name}
                           {isSelected && <Check size={14} strokeWidth={3}/>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Customization */}
              <div className="animate-fade-in" style={{animationDelay: '150ms'}}>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">甜度</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {SUGAR_OPTIONS.map(opt => (
                    <button 
                      key={opt} 
                      onClick={() => setSugar(opt)} 
                      className={`text-xs py-2.5 rounded-lg border font-bold transition-all hover:scale-105 ${
                        sugar === opt ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm ring-2 ring-amber-100' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt.split(' ')[0]}
                      <span className="block text-[10px] font-normal scale-90">{opt.split(' ')[1] || ''}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="animate-fade-in" style={{animationDelay: '200ms'}}>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">冰塊</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {ICE_OPTIONS.map(opt => (
                    <button 
                      key={opt} 
                      onClick={() => setIce(opt)} 
                      className={`text-xs py-2.5 rounded-lg border font-bold transition-all hover:scale-105 ${
                        ice === opt ? 'bg-cyan-50 border-cyan-400 text-cyan-700 shadow-sm ring-2 ring-cyan-100' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-4">
               <div className="hidden sm:flex items-center mr-auto gap-2 text-gray-500 text-sm font-medium px-2">
                 <span>{size === 'M' ? '中杯' : '大杯'}</span>
                 <span>•</span>
                 <span>{sugar}</span>
                 <span>•</span>
                 <span>{ice}</span>
               </div>
               <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors"
               >
                 取消
               </button>
              <button 
                onClick={addToCartLocal} 
                className="flex-1 sm:flex-none sm:w-48 bg-sky-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-sky-200 active:scale-[0.98] transition-all flex justify-center gap-2 items-center hover:bg-sky-600 hover:shadow-sky-300"
              >
                <span>加入訂單</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm text-white font-mono border border-white/20">
                  ${(size === 'M' ? currentItem.priceM : currentItem.priceL) + (selectedToppings.length * 10)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">確認刪除品項？</h3>
            <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 mb-8 flex items-center gap-3">
               <div className="bg-white p-2 rounded-full text-red-400">
                  <Trash2 size={20}/>
               </div>
               <div>
                 <p className="font-bold text-gray-800">{itemToDelete.name}</p>
                 <p className="text-xs text-gray-500 mt-0.5 font-medium">{itemToDelete.userName} • ${itemToDelete.price}</p>
               </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleDeleteItem}
                className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation */}
      {isClearModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-red-50">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">清空所有訂單？</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed px-4">
              確定要刪除所有已點的飲料嗎？<br/>此動作無法復原，請謹慎操作。
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsClearModalOpen(false)} 
                className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
              >
                保留
              </button>
              <button 
                onClick={handleConfirmClearAll} 
                className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
              >
                全部清空
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;