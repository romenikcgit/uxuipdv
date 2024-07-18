const productGrid = document.getElementById('product-grid');
const addProductForm = document.getElementById('add-product-form');
const cartIcon = document.getElementById('cart-icon');
const cartBadge = document.getElementById('cart-badge');
const cartMenu = document.getElementById('cart-menu');
const cartItems = document.getElementById('cart-items');
const totalAmount = document.getElementById('total-amount');
const paymentMethod = document.getElementById('payment-method');
const cashPayment = document.getElementById('cash-payment');
const cashAmount = document.getElementById('cash-amount');
const changeAmount = document.getElementById('change-amount');
const processPayment = document.getElementById('process-payment');
const printOrder = document.getElementById('print-order');
const notification = document.getElementById('notification');
const showCatalog = document.getElementById('show-catalog');
const showManagement = document.getElementById('show-management');
const showTables = document.getElementById('show-tables');
const showHistory = document.getElementById('show-history');
const catalogSection = document.getElementById('catalog-section');
const managementSection = document.getElementById('management-section');
const tablesSection = document.getElementById('tables-section');
const historySection = document.getElementById('history-section');
const categoriesContainer = document.getElementById('categories-container');
const productList = document.getElementById('product-list');
const cartCount = document.getElementById('cart-count');
const salesHistory = document.getElementById('sales-history');

let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let tables = JSON.parse(localStorage.getItem('tables')) || [];
let currentTable = null;

function saveToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('sales', JSON.stringify(sales));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('tables', JSON.stringify(tables));
}

function updateCartBadge() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartBadge.textContent = count;
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
    cartBadge.textContent = count;
}

function updateTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalAmount.textContent = total.toFixed(2);
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function renderCategories() {
    categoriesContainer.innerHTML = '<button class="category-button active" data-category="all">Todas</button>';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.classList.add('category-button');
        button.textContent = category.name;
        button.dataset.category = category.name;
        categoriesContainer.appendChild(button);
    });
}

function renderProducts(category = 'all') {
    productGrid.innerHTML = '';
    products.forEach((product, index) => {
        if (category === 'all' || product.category === category) {
            const productElement = document.createElement('div');
            productElement.classList.add('product-item');
            productElement.innerHTML = `
                <h3>${product.name}</h3>
                <p>R$ ${product.price.toFixed(2)}</p>
                <p>Categoria: ${product.category}</p>
                <button onclick="addToCart(${index})"><i class="fas fa-cart-plus"></i> Adicionar</button>
            `;
            productGrid.appendChild(productElement);
        }
    });
}

function renderProductList() {
    productList.innerHTML = '';
    products.forEach((product, index) => {
        const productElement = document.createElement('div');
        productElement.classList.add('product-item-manage');
        productElement.innerHTML = `
            <span>${product.name} - R$ ${product.price.toFixed(2)} - ${product.category}</span>
            <div>
                <button onclick="editProduct(${index})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteProduct(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        productList.appendChild(productElement);
    });
}

function renderCategoryList() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    categories.forEach((category, index) => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category-item');
        categoryElement.innerHTML = `
            <span>${category.name}</span>
            <div>
                <button onclick="editCategory(${index})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteCategory(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        categoryList.appendChild(categoryElement);
    });
}

function renderTableList() {
    const tableList = document.getElementById('table-list');
    tableList.innerHTML = '';
    tables.forEach((table, index) => {
        const tableElement = document.createElement('div');
        tableElement.classList.add('table-item');
        const orderSummary = table.order.length > 0 
            ? `<p>Itens: ${table.order.length}, Total: R$ ${calculateOrderTotal(table.order).toFixed(2)}</p>`
            : '<p>Mesa vazia</p>';
        tableElement.innerHTML = `
            <span>${table.name}</span>
            ${orderSummary}
            <div>
                <button onclick="openTableOrder(${index})">Abrir Pedido</button>
                <button onclick="editTable(${index})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTable(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        tableList.appendChild(tableElement);
    });
}

function renderCart() {
    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.name} - R$ ${item.price.toFixed(2)} x ${item.quantity}
            <button onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
        `;
        cartItems.appendChild(li);
    });
    updateTotal();
    updateCartCount();
}

function renderSalesHistory() {
    salesHistory.innerHTML = '';
    sales.forEach((sale, index) => {
        const saleElement = document.createElement('div');
        saleElement.classList.add('sale-item');
        saleElement.innerHTML = `
            <h3>Venda #${index + 1}</h3>
            <p>Data: ${new Date(sale.date).toLocaleString()}</p>
            <p>Total: R$ ${sale.total.toFixed(2)}</p>
            <p>Método de Pagamento: ${sale.paymentMethod}</p>
            <p>Mesa: ${sale.table}</p>
            <button onclick="showSaleDetails(${index})">Ver Detalhes</button>
        `;
        salesHistory.appendChild(saleElement);
    });
}

function addProduct(event) {
    event.preventDefault();
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    if (!category) {
        showNotification('Por favor, selecione uma categoria.');
        return;
    }
    products.push({ name, price, category });
    saveToLocalStorage();
    renderProducts();
    renderProductList();
    addProductForm.reset();
    showNotification('Produto adicionado com sucesso!');
}

function addToCart(index) {
    const product = products[index];
    const existingItem = cart.find(item => item.name === product.name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveToLocalStorage();
    updateCartBadge();
    renderCart();
    showNotification('Produto adicionado ao carrinho!');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveToLocalStorage();
    updateCartBadge();
    renderCart();
    showNotification('Produto removido do carrinho!');
}

function editProduct(index) {
    const product = products[index];
    const newName = prompt('Novo nome do produto:', product.name);
    const newPrice = parseFloat(prompt('Novo preço do produto:', product.price));
    const newCategory = prompt('Nova categoria do produto:', product.category);
    if (newName && !isNaN(newPrice) && newCategory) {
        products[index] = { name: newName, price: newPrice, category: newCategory };
        saveToLocalStorage();
        renderProducts();
        renderProductList();
        showNotification('Produto atualizado com sucesso!');
    }
}

function deleteProduct(index) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        products.splice(index, 1);
        saveToLocalStorage();
        renderProducts();
        renderProductList();
        showNotification('Produto excluído com sucesso!');
    }
}

function addCategory(event) {
    event.preventDefault();
    const name = document.getElementById('category-name').value;
    categories.push({ name });
    saveToLocalStorage();
    renderCategories();
    renderCategoryList();
    document.getElementById('add-category-form').reset();
    showNotification('Categoria adicionada com sucesso!');
}

function editCategory(index) {
    const category = categories[index];
    const newName = prompt('Novo nome da categoria:', category.name);
    if (newName) {
        categories[index].name = newName;
        saveToLocalStorage();
        renderCategories();
        renderCategoryList();
        showNotification('Categoria atualizada com sucesso!');
    }
}

function deleteCategory(index) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        categories.splice(index, 1);
        saveToLocalStorage();
        renderCategories();
        renderCategoryList();
        showNotification('Categoria excluída com sucesso!');
    }
}

function addTable(event) {
    event.preventDefault();
    const name = document.getElementById('table-name').value;
    tables.push({ name, order: [] });
    saveToLocalStorage();
    renderTableList();
    document.getElementById('add-table-form').reset();
    showNotification('Mesa adicionada com sucesso!');
}

function editTable(index) {
    const table = tables[index];
    const newName = prompt('Novo nome/número da mesa:', table.name);
    if (newName) {
        tables[index].name = newName;
        saveToLocalStorage();
        renderTableList();
        showNotification('Mesa atualizada com sucesso!');
    }
}

function deleteTable(index) {
    if (confirm('Tem certeza que deseja excluir esta mesa?')) {
        tables.splice(index, 1);
        saveToLocalStorage();
        renderTableList();
        showNotification('Mesa excluída com sucesso!');
    }
}

function openTableOrder(index) {
    currentTable = tables[index];
    cart = [...currentTable.order];
    renderCart();
    toggleCartMenu();
    showNotification(`Pedido da mesa ${currentTable.name} aberto`);
}

function toggleCartMenu() {
    cartMenu.classList.toggle('hidden');
}

function handlePaymentMethod() {
    cashPayment.classList.toggle('hidden', paymentMethod.value !== 'cash');
}

function calculateChange() {
    const total = parseFloat(totalAmount.textContent);
    const paid = parseFloat(cashAmount.value);
    const change = paid - total;
    changeAmount.textContent = change >= 0 ? change.toFixed(2) : '0.00';
}

function processPaymentHandler() {
    if (cart.length === 0) {
        showNotification('O carrinho está vazio!');
        return;
    }

    const method = paymentMethod.value;
    if (method === 'cash') {
        const paid = parseFloat(cashAmount.value);
        const total = parseFloat(totalAmount.textContent);
        if (paid < total) {
            showNotification('Valor insuficiente!');
            return;
        }
    }

    const sale = {
        items: [...cart],
        total: parseFloat(totalAmount.textContent),
        paymentMethod: method,
        date: new Date().toISOString(),
        table: currentTable ? currentTable.name : 'Balcão'
    };
    sales.push(sale);
    
    if (currentTable) {
        currentTable.order = [];
        const tableIndex = tables.findIndex(t => t.name === currentTable.name);
        if (tableIndex !== -1) {
            tables[tableIndex] = currentTable;
        }
    }
    
    currentTable = null;
    cart = [];
    saveToLocalStorage();
    updateCartBadge();
    renderCart();
    renderTableList();
    renderSalesHistory();
    cartMenu.classList.add('hidden');
    showNotification('Pagamento processado com sucesso!');
}

function printOrderHandler() {
    if (cart.length === 0) {
        showNotification('O carrinho está vazio!');
        return;
    }

    let orderContent = `
        <h2>Comanda do Cliente</h2>
        <p>Data: ${new Date().toLocaleString()}</p>
        <p>Mesa: ${currentTable ? currentTable.name : 'Balcão'}</p>
        <ul>
    `;

    cart.forEach(item => {
        orderContent += `<li>${item.name} - R$ ${item.price.toFixed(2)} x ${item.quantity}</li>`;
    });

    orderContent += `
        </ul>
        <p><strong>Total: R$ ${totalAmount.textContent}</strong></p>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Comanda do Cliente</title></head><body>');
    printWindow.document.write(orderContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function showSaleDetails(index) {
    const sale = sales[index];
    let detailsContent = `
        <h3>Detalhes da Venda #${index + 1}</h3>
        <p>Data: ${new Date(sale.date).toLocaleString()}</p>
        <p>Mesa: ${sale.table}</p>
        <p>Método de Pagamento: ${sale.paymentMethod}</p>
        <ul>
    `;

    sale.items.forEach(item => {
        detailsContent += `<li>${item.name} - R$ ${item.price.toFixed(2)} x ${item.quantity}</li>`;
    });

    detailsContent += `
        </ul>
        <p><strong>Total: R$ ${sale.total.toFixed(2)}</strong></p>
    `;

    alert(detailsContent);
}

function toggleSection(section) {
    catalogSection.classList.add('hidden');
    managementSection.classList.add('hidden');
    tablesSection.classList.add('hidden');
    historySection.classList.add('hidden');
    showCatalog.classList.remove('active');
    showManagement.classList.remove('active');
    showTables.classList.remove('active');
    showHistory.classList.remove('active');

    if (section === 'catalog') {
        catalogSection.classList.remove('hidden');
        showCatalog.classList.add('active');
    } else if (section === 'management') {
        managementSection.classList.remove('hidden');
        showManagement.classList.add('active');
    } else if (section === 'tables') {
        tablesSection.classList.remove('hidden');
        showTables.classList.add('active');
    } else if (section === 'history') {
        historySection.classList.remove('hidden');
        showHistory.classList.add('active');
    }
}

function calculateOrderTotal(order) {
    return order.reduce((total, item) => total + item.price * item.quantity, 0);
}

function startCounterSale() {
    currentTable = null;
    cart = [];
    renderCart();
    toggleCartMenu();
    showNotification('Nova venda no balcão iniciada');
}

function populateCategorySelect() {
    const select = document.getElementById('product-category');
    select.innerHTML = '<option value="">Selecione uma categoria</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

addProductForm.addEventListener('submit', addProduct);
document.getElementById('add-category-form').addEventListener('submit', addCategory);
document.getElementById('add-table-form').addEventListener('submit', addTable);
cartIcon.addEventListener('click', toggleCartMenu);
paymentMethod.addEventListener('change', handlePaymentMethod);
cashAmount.addEventListener('input', calculateChange);
processPayment.addEventListener('click', processPaymentHandler);
printOrder.addEventListener('click', printOrderHandler);
showCatalog.addEventListener('click', () => toggleSection('catalog'));
showManagement.addEventListener('click', () => toggleSection('management'));
showTables.addEventListener('click', () => toggleSection('tables'));
showHistory.addEventListener('click', () => toggleSection('history'));

categoriesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('category-button')) {
        document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        renderProducts(event.target.dataset.category);
    }
});

document.addEventListener('click', (event) => {
    if (!cartMenu.contains(event.target) && !cartIcon.contains(event.target)) {
        cartMenu.classList.add('hidden');
    }
});

document.getElementById('add-category-form').addEventListener('submit', () => {
    setTimeout(populateCategorySelect, 0);
});

const counterSaleButton = document.getElementById('counter-sale-button');
counterSaleButton.addEventListener('click', startCounterSale);

renderCategories();
renderProducts();
renderProductList();
renderCategoryList();
renderTableList();
updateCartBadge();
updateCartCount();
renderCart();
renderSalesHistory();
populateCategorySelect();