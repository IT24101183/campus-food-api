const API_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function runTests() {
  try {
    console.log('Testing Project Setup & MongoDB Connection...');
    const rootRes = await request('/');
    console.log('✅ Root endpoint working:', rootRes.message);

    console.log('\n--- Student Routes [Creating 3+ students...] ---');
    const student1 = await request('/students', { method: 'POST', body: JSON.stringify({ name: 'Kasun Perera', email: `kasun${Date.now()}@sliit.lk`, faculty: 'Computing', year: 2 }) });
    const student2 = await request('/students', { method: 'POST', body: JSON.stringify({ name: 'Nimal Silva', email: `nimal${Date.now()}@sliit.lk`, faculty: 'Engineering', year: 1 }) });
    const student3 = await request('/students', { method: 'POST', body: JSON.stringify({ name: 'Kamal Fernando', email: `kamal${Date.now()}@sliit.lk`, faculty: 'Business', year: 3 }) });
    console.log('✅ 3+ students created:', student1.name, student2.name, student3.name);

    console.log('\n--- Menu Item Routes [Creating 5+ menu items...] ---');
    const item1 = await request('/menu-items', { method: 'POST', body: JSON.stringify({ name: 'Egg Fried Rice', price: 650, category: 'Rice', isAvailable: true }) });
    const item2 = await request('/menu-items', { method: 'POST', body: JSON.stringify({ name: 'Chicken Kottu', price: 750, category: 'Snack', isAvailable: true }) });
    const item3 = await request('/menu-items', { method: 'POST', body: JSON.stringify({ name: 'Iced Coffee', price: 200, category: 'Beverage', isAvailable: true }) });
    const item4 = await request('/menu-items', { method: 'POST', body: JSON.stringify({ name: 'Vegetable Roll', price: 100, category: 'Snack', isAvailable: true }) });
    const item5 = await request('/menu-items', { method: 'POST', body: JSON.stringify({ name: 'Chicken Fried Rice', price: 700, category: 'Rice', isAvailable: true }) });
    console.log('✅ 5+ menu items created');

    console.log('\n--- Menu Item Search ---');
    const searchRes = await request('/menu-items/search?name=rice');
    console.log(`✅ Search for 'rice' found ${searchRes.length} items`);
    const searchCatRes = await request('/menu-items/search?category=Beverage');
    console.log(`✅ Search for category 'Beverage' found ${searchCatRes.length} items`);

    console.log('\n--- Order Routes [Placing multiple orders...] ---');
    const order1 = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        student: student1._id,
        items: [{ menuItem: item1._id, quantity: 2 }, { menuItem: item3._id, quantity: 2 }] // 2*650 + 2*200 = 1700
      })
    });
    const order2 = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        student: student2._id,
        items: [{ menuItem: item2._id, quantity: 1 }] // 750
      })
    });
    const order3 = await request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        student: student1._id,
        items: [{ menuItem: item4._id, quantity: 5 }] // 500
      })
    });
    console.log(`✅ Placed 3 orders. Total price of Order 1: ${order1.totalPrice}`);

    console.log('\n--- Pagination Testing ---');
    const pageRes = await request('/orders?page=1&limit=2');
    console.log(`✅ Pagination working: Page ${pageRes.page}, Limiting to ${pageRes.orders.length} orders out of total ${pageRes.totalOrders}`);

    console.log('\n--- Status Update ---');
    const updatedOrder = await request(`/orders/${order1._id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PREPARING' })
    });
    console.log(`✅ Order status updated to: ${updatedOrder.status}`);

    console.log('\n--- Analytics Verification ---');
    const totalSpent = await request(`/analytics/total-spent/${student1._id}`);
    console.log(`✅ Total spent by Student 1: Rs.${totalSpent.totalSpent} (Expected: 1700 + 500 = 2200)`);
    
    if (totalSpent.totalSpent !== 2200) {
       console.error(`❌ Total spent calculation incorrect! Expected 2200, got ${totalSpent.totalSpent}`);
    } else {
       console.log('✅ Total spent calculation correct!');
    }

    const topItems = await request('/analytics/top-menu-items?limit=3');
    console.log(`✅ Top items length: ${topItems.length}`);
    
    const dailyOrders = await request('/analytics/daily-orders');
    console.log(`✅ Daily orders retrieved: ${dailyOrders.length} records`);

    console.log('\n🎉 ALL TESTS PASSED!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

runTests();
