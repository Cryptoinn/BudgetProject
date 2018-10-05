var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome>0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1
        }

    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value
        });
        data.totals[type] = sum;

    }

    var allExpenses = [];
    var allIncome = [];
    var totalExpenses = 0;

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }

    return {
        additem: function(type, des, val){
            var newItem, ID;

            console.log(data);
            console.log(type,'   ',des,'    ',val);
            console.log('len=',data.allItems[type].length);

            if (data.allItems[type].length>0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            console.log(data.allItems[type].length,' !!!! ', ID);

            } else {
                ID = 0;
            }


            if (type=== 'exp'){
                newItem = new Expense(ID,des,val);
                
            } else if (type === 'inc'){
                newItem = new Income(ID,des,val);
                
            }

            data.allItems[type].push(newItem);


            return newItem;
        },

        deleteItem: function(type,id){
                var index, ids;
                ids = data.allItems[type].map(function(current){
                    return current.id;
                });
                console.log(ids);
                index = ids.indexOf(parseInt(id));
                console.log(id,'--->',index);                           

                if (index !== -1) {
                    data.allItems[type].splice(index,1);
                }

        },

        calculateBudget: function(){
            calculateTotal('inc');
            calculateTotal('exp');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
                console.log(data.percentage);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function (){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                    return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function(){
            return {
                budget:data.budget,
                percentage:data.percentage,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp
            }
        }
    }



})();


var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit;

        num= Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0,int.length - 3)+','+int.substr(int.length-3,3); // 2310 -> 2,310
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


    return {
        getInput:function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHTML, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type ==='exp'){
                element = DOMstrings.expensesContainer;
            html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            newHTML = newHTML.replace('%description%', obj.description);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function(){
            var inputField;
           //fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue)
           inputField = document.querySelector(DOMstrings.inputValue);
           inputField.value = '';
           inputField = document.querySelector(DOMstrings.inputDescription);
           inputField.value = '';
           inputField.focus();
           
        },

        displayBudget: function(obj){
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, type);
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, type);

            if (obj.percentage>0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
        
        nodeListForEach(fields,function(current,index){
                if(percentages[index]>0){
                current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---'
                };
            });
        },

        displayMount: function() {
            var now, year, mount;
            now = new Date();
            console.log(now);
            months = ["Jan",'Feb', 'Mar', 'Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

            year = now.getFullYear();
            mount = months[now.getMonth()];
            document.querySelector(DOMstrings.dateLabel).textContent = mount + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    }




})();

var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAdditem);

        document.addEventListener('keypress',function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAdditem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };

    var updateBudget = function(){
        //1
        budgetCtrl.calculateBudget();
        //2
        var budget = budgetCtrl.getBudget();
        console.log(budget);
        //
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        //1
        budgetCtrl.calculatePercentages();
        //2
        var percentages = budgetCtrl.getPercentages();
        //3
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAdditem = function(){
        
        var input,newItem;
        // 1
        input = UICtrl.getInput();
        
        if (input.description !== "" && input.value > 0 && !isNaN(input.value)){    // test fields for the values
            // 2
            newItem = budgetCtrl.additem(input.type, input.description, input.value);
            // 3
            UICtrl.addListItem(newItem, input.type);
            // 4
            UICtrl.clearFields();
            // 5
            updateBudget();
            // 6
            updatePercentages();

        }

    }

    var ctrlDeleteItem = function(event) {
        var itemID,splitID,type;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            budgetCtrl.deleteItem(type, ID);

            UICtrl.deleteListItem(itemID);

            updateBudget();

            updatePercentages();

        }


    };

    return {
        init: function(){
            console.log('Events work');
            setupEventListeners();
            UICtrl.displayMount();
        }
    };




})(budgetController,UIController);

controller.init();