let currentType = 'bottles';

let dataJson = {
    getData() {
        return JSON.parse(localStorage.getItem('dataJson')) || defaultDataJson;
    },
    set bottles(value) {
        if (!value) {
            return;
        }

        var data = this.getData();
        data.bottles = value;

        if (typeof data === "object") {
            data = JSON.stringify(data);
        }

        localStorage.setItem('dataJson', data);
        render();
    },
    get bottles() {
        var value = this.getData();

        return value.bottles;
    },
    set metal(value) {
        if (!value) {
            return;
        }

        var data = this.getData();
        data.metal = value;

        if (typeof data === "object") {
            data = JSON.stringify(data);
        }

        localStorage.setItem('dataJson', data);
        render();
    },
    get metal() {
        var value = this.getData();

        return value.metal;
    }
};

function tableCreate(table, editMode) {
    table.innerHTML = '';
    dataJson[currentType].forEach((item, id) => {
        table.innerHTML += generateRow([id, item], editMode);
    });
}

function generateRow([id, item], editMode) {
    let row = `<tr id="${id}">`;

    row = `${row}<th class="table-active"><a href="#" data-field="name" data-id="${id}" class="editable">${item.name}</a></th>
                <th><a href="#" data-field="price" data-id="${id}" class="editable">${item.price}</a></th>
                <th><a class="always-editable" data-field="count" data-id="${id}">${item.count}</a></th>`;

    row = editMode ?
        `${row}<th data-id="${id}"><button onclick="onRemove(${id})">Удалить</button></th>` :
        `${row}<th data-type="sum">${item.price * item.count}</th>`;

    return `${row}</tr>`;
}

function generateEmptyRow() {
    return `<tr id="newRecord">
                <th class="table-active"><input data-field="name"></th>
                <th><input data-field="price" type="number"></th>
                <th data-type="sum">--</th>
                <th>${addSaveButton()}</th>
            </tr>`;
}

function getFooter(mainCount, mainSum) {
    return `<tr>
                <th>${addEditButton()}</th>
                <th>Итого</th>
                <th>${mainCount} ${currentType == 'bottles' ? 'Шт' : 'Кг'}</th>
                <th>${mainSum} Грн</th>
            </tr>`;
}

function render(withEmptyRow = false) {
    let table = document.querySelector("#bottles tbody");
    tableCreate(table, withEmptyRow);
    if (withEmptyRow) {
        table.innerHTML += generateEmptyRow();
    }

    const mainCount = dataJson[currentType].reduce((a, b) => a + Number(b.count), 0);
    const mainSum = dataJson[currentType].reduce((a, b) => a + (Number(b.price) * Number(b.count)), 0);
    table.innerHTML += getFooter(mainCount, mainSum);

    $('#bottles .editable').editable({
        disabled: true,
        success: function (response, newValue) {
            const {id, field} = $(this).data();
            newValue = newValue.replace(/,/g, '\.');
            let bottles = dataJson[currentType];
            if (Number(newValue) > Number(bottles[id][field])) {
                bottles[id][field] = newValue;
                dataJson[currentType] = bottles;
            }
        }
    });

    $('#bottles .always-editable').editable({
        success: function (response, newValue) {
            const {id, field} = $(this).data();

            newValue = Number(newValue);
            let bottles = dataJson[currentType];
            if (newValue > Number(bottles[id][field])) {
                bottles[id][field] = newValue;
                dataJson[currentType] = bottles;
            }
        }
    });

    $('#on-edit').click(function () {
        render(!withEmptyRow);
        $('#bottles .editable').editable('toggleDisabled');
    });
}

function addEditButton() {
    return `<button type="button" class="btn btn-default btn-lg" id="on-edit">
        <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Редактировать
        </button>`;
}

function addSaveButton() {
    return `<button type="button" class="btn btn-default btn-lg" onclick="onSave(this)">
        <span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span> Добавить
        </button>`;
}

function onRemove(id) {
    console.log(id);
    if (confirm(`Удалить запись ${dataJson[currentType][id].name} ?`)) {
        let data = dataJson[currentType];
        data.splice(id, 1);
        dataJson[currentType] = data;
        render();

        console.log(dataJson[currentType]);
    }
}

function onSave() {
    const newItem = {count: 0};
    let hasError = false;

    $('#newRecord [data-field]').removeClass('error');
    $('#newRecord [data-field]').each(function () {
        if (!$(this).val().length) {
            $(this).addClass('error');
            hasError = true;
        }
        newItem[$(this).data('field')] = $(this).val();
    });

    if (!hasError) {
        let bottles = dataJson[currentType];
        bottles.push(newItem);
        dataJson[currentType] = bottles;
        render();
    }
}

function onReset() {
    if (confirm(`Удалить данные о количестве?`)) {
        let data = dataJson[currentType];
        data.map(item => item.count = 0);
        dataJson[currentType] = data;

        render();
    }
}

$(document).ready(function () {
    render();

    //enable / disable
    $.fn.editable.defaults.mode = 'inline';

    $('#navbar a').click(function (e) {
        e.preventDefault();
        currentType = $(this).data('tab');
        $('#navbar li').removeClass('active');
        $(this).closest('li').addClass('active');
        render();
    });
});