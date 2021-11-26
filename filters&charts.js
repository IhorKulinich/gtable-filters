//
// GOOGLE APPS SCRIPT ONLY ( BASED ON JAVASCRIPT )
//

const table = SpreadsheetApp.openById("ID");
// SpreadsheetApp - google apps script class
// that access or create Google Sheets files
// openById - method of this class
// that opens the spreadsheet with the given ID. A spreadsheet ID can be extracted from its URL
// and return Spreadsheet class object with the given id
// src : https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app?hl=en#openById(String)

const workflow = table.getSheetByName("BOARD_1");
const priv = table.getSheetByName("BOARD_2");
// getSheetByName - method of the Spreadsheet class
// that returns a sheet object with the given name

//https://developers.google.com/apps-script/reference/spreadsheet

const reseterFilter = superclass => class extends superclass {

    reset(condition, filter, criteria, isnew, columnRead) {
        /*
        remove filtering from table data by filters column and criteria
        if we checked another filter from dropdownlist - understends wich with filterSwitcher
        and set new, else - just redactoring table visible data - its will be without this filter
        */

        this.remover(this.columnRead || columnRead);

        switch (true) {

            case (condition && isnew):
                //if value of cheked dropdownlist isn't default
                //and if we doesn't just clear filters when reopen page with table

                this.set = SpreadsheetApp.newFilterCriteria();
                //Creates a builder for a FilterCriteria class of google table sheet and return builder

                this.bool(this.type, this.context).build();
                //then we must build logic with wich will work filter we building
                //and Constructs a filter criteria from the settings supplied to the builder.
                //return builded filtercriteria

                this.filter.setColumnFilterCriteria(this.columnRead, this.set);
                //Sets the filter criteria on the specified column.

                //https://developers.google.com/apps-script/reference/spreadsheet/filter
                //https://developers.google.com/apps-script/reference/spreadsheet/filter-criteria

                break;

            case (condition && !isnew):

                this.filter.setColumnFilterCriteria(columnRead, criteria);

                break;

        }

    }

}

const removerFilter = superclass => class extends superclass {

    remover() {
        /*
        we must remove old filter criteria from data by column, before build anoter one by that column
        or just for set visible all data in the table
        */

        this.filter.removeColumnFilterCriteria(this.columnRead);
        //Removes the filter criteria from the specified column.

    }

};

class filterParent {

    constructor(transfer) {

        this.columnWrite = transfer.columnWrite;

        this.columnRead = transfer.columnRead;

        this.context = transfer.context;

        this.data = transfer.data;

        this.board = transfer.board;

        this.filter = this.data.getFilter() || this.data.createFilter();

        this.set = null;

        this.type = transfer.type;

    }

}

class whenText extends removerFilter(reseterFilter(filterParent)) {

    bool(type, context) {
        /*
        logic when we looking just for containing value of cheked dropdown list item
        */

        return this.set.whenTextContains(context);
        //Sets the filter criteria to show cells where the cell text contains the specified text.

    }

}

class whenDate extends removerFilter(reseterFilter(filterParent)) {

    bool(type, context) {
        /*
        logic when we looking for month data substring 
        */

        switch (type) {

            case ("month"):

                const month = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];

                var value = month.indexOf(context);

                value = value < 9 ? "0" + (value + 1).toString() : (value + 1).toString();

                return this.set.whenTextContains("." + value.toString() + ".");

                break;

        }

    }

}

class whenBackground extends removerFilter(reseterFilter(filterParent)) {

    bool(type, context) {
        /*
        before success with color detecting
        looking for date of sell
        couse we writing it, also
        wish contained year, and part "20" too
        */

        return this.set.whenTextContains("20");

    }

    trycolor() {
        /*
        but now i don't now how migrate data about cheking row, row by row in the table
        and how get access to the row integer number
        to check background color of that cells
        */

        return this.set.whenFormulaSatisfied("=customFormula");
        //Sets the filter criteria to show cells where the specified formula (such as =B:B<C:C) evaluates to true.
        //formula can be code custom functions

    }

    customFormula() {
        /*
        don't know what should write
        */

    }

}

class filterSwitcher {

    constructor(board, columnWrite, context, data, settings) {

        this.columnWrite = columnWrite;

        this.context = context;

        this.data = data;

        this.board = board;

        this.setted = settings;

        this.boardIndex = this.setted.sheets.map(sheet => sheet.getName()).indexOf(this.board.getName());

        this.ident = this.setted.listRanges[this.boardIndex][1].indexOf(columnWrite);

        this.columnRead = this.setted.dataRanges[this.boardIndex][1][this.ident];

        this.type = [["month", "text", "text", "text", "text"], ["month", "text", "text", "text", "color"]][this.boardIndex][this.ident];

    }

    init() {
        /*
        initiating diferent variants of filter logic by getted type of data we need to build logic around
        */

        var transfer = { board: this.board, columnWrite: this.columnWrite, context: this.context, data: this.data, columnRead: this.columnRead, type: this.type };

        switch (this.type) {

            case ("month" || "date"):

                return new whenDate(transfer);

                break;

            case "text":

                return new whenText(transfer);

                break;

            case "color":

                return new whenBackground(transfer);

                break;

        }

    }

}

class DropdownList {

    constructor(sheet, defaultItem, settings) {

        this.sheet = sheet;

        this.def = defaultItem;

        this.setted = settings;

        var ind = this.setted.sheets.map(sheet => sheet.getName()).indexOf(this.sheet.getName());

        var columnlist = this.setted.listRanges[ind][1][this.setted.ItemsIndex[ind].indexOf(this.setted.defItems.indexOf(defaultItem))];

        this.row = this.setted.listRanges[ind][0] - 1;

        this.range = this.sheet.getRange(this.row, columnlist);

        this.rule = this.range.getDataValidation();

        this.args = this.rule.getCriteriaValues();

        this.criteria = this.rule.getCriteriaType();

        this.dataforlist = this.sheet.getRange(this.row + 1, 1, this.sheet.getLastRow() - this.row - 1, 1);

        this.newList = [];

        this.newItem = null;

        this.condition = null;

    }

}

const ItemsList = superclass => class extends superclass {

    newItems(condition) {
        /*
        methods that changing dropdownlist items list when it is necessery
        */

        this.condition = condition || this.args[0].length != this.newList[0].length ? this.args[0][0] != this.newList[0][0] : false;

        if (this.condition) {

            this.rule = SpreadsheetApp.newDataValidation().withCriteria(this.criteria, this.newList).build();
            //Creates a builder for a data validation rule and return new builder.
            //Sets the data validation rule to criteria defined by DataValidationCriteria values,
            //typically taken from the criteria and arguments of an existing rule.
            //Constructs a data validation rule from the settings applied to the builder.

            SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(this.range).setDataValidation(this.rule);
            //Sets one data validation rule for all cells in the range

            //https://developers.google.com/apps-script/reference/spreadsheet/data-validation

        }

    }

}

const getYears = superclass => class extends superclass {

    get() {
        /*
        analyze list of years from dates from that table data
        */

        return this.newList = this.dataforlist.getValues().filter(date => this.newList.indexOf(date.toString().split(" ")[3]) === -1 ? true : false);

    }

}

const newYear = superclass => class extends superclass {

    find() {
        /*
        looking for anothers years 
        */

        this.newList.forEach(year => this.args.indexOf(year) === -1 ? this.newItem = year : null);

        this.newList.unshift(this.def);

        this.newList = [this.newList, true];

    }

}

class whenNewYear extends newYear(getYears(ItemsList(DropdownList))) {

    add() {
        /*
        and if found new another years - push it like new dropdownlist items
        */

        this.get();

        this.find();

        return this.newItems(null);

    }

}

class filterIs {

    constructor(sheet, column, criteria, data, settings) {

        this.setted = settings;

        this.sheet = sheet;

        this.column = column || settings.dataRanges[sheet][1].filter(column => getColumnFilterCriteria(column) != null);

        this.criteria = criteria || settings.dataRanges[sheet][1].forEach(column => getColumnFilterCriteria(column)).filter(criteria => criteria != null);

        this.data = data || sheet.getRange(settings.listRanges[sheet][0], 1, sheet.getLastRow(), sheet.getLastColumn());

        this.filter = this.data.getFilter();

    }

}

class whenIs extends removerFilter(reseterFilter(filterIs)) {

    update() {
        /*
        updating borders of filtering data by reseting (rebuilding) that filter
        */

        if (this.criteria.length != 0) {

            this.criteria.forEach((crit, index) => reset(true, this.filter, crit, false, this.column[index]));

        }

    }

}

class Settings {

    constructor(sheets, listRanges, dataRanges, defItems, defItmesInd) {

        this.sheets = sheets.map(sheet => table.getSheetByName(sheet));

        this.listRanges = listRanges;

        this.dataRanges = dataRanges;

        this.defItems = defItems;

        this.ItemsIndex = defItmesInd;

    }

}

const whenClear = superclass => class extends superclass {

    clearFilters() {
        /*
        clear all filters to default visiable that table data, when reopening page with tables sheets
        */

        this.sheets.forEach(this.remove);

    }

    remove(sheet, index) {
        /*
        removing all filters and change all dropdown list items values to default
        */

        var index = this.sheets.indexOf(sheet);

        var row = this.listRanges[sheet][0] - 1;

        var data = sheet.getRange(row, 1, sheet.getLastRow(), sheet.getLastColumn());

        var filter = data.getFilter();

        if (filter != null && filter != undefined) {

            this.dataRanges[index][1].forEach((column, index) => reset(false, filter, filter.getColumnFilterCriteria(column), false, column));

            this.listRanges[index][1].forEach((column, index) => {

                sheet.getRange(row - 1, column).setValue(this.defItems[this.ItemsIndex[index]]);

            });

        }

    }

}


class whenOpen extends reseterFilter(whenClear(Settings)) {

    reopen() {
        /*
        call method
        */

        this.clearFilters();

    }

}

class eData {

    constructor(sheet, range, value, setted) {

        this.sheet = table.getSheetByName(sheet);

        this.range = range;

        this.value = value;

        this.setted = setted;

        var ind = this.setted.sheets.map(sheet => sheet.getName()).indexOf(this.sheet.getName());

        var row = this.setted.listRanges[ind][0] - 1;

        this.data = this.sheet.getRange(row + 1, 1, this.sheet.getLastRow() - row - 1, 1);

    }

}

class whenSwithcer extends reseterFilter(eData) {

    init() {
        /*
        understanding what is happens in the script algorythm and initiate methods wich may start
        */

        var isSheet = this.setted.sheets.map(sheet => sheet.getName()).indexOf(this.sheet.getName());

        if (isSheet != -1) {

            var whenListRow = this.setted.listRanges[isSheet][0] - 1 === this.range.getRow();

            var ListColumn = this.setted.listRanges[isSheet][1].indexOf(this.range.getColumn());

            var whenDataRow = this.setted.dataRanges[isSheet][0] === this.range.getRow();

            var DataColumn = this.setted.dataRanges[isSheet][1].indexOf(this.range.getColumn());

            switch (true) {

                case (whenListRow ? ListColumn != -1 : false):
                    // when changed some cell context in the row with dropdown lisits we may reset filters

                    this.isCheking();

                    break;

                case (whenDataRow ? DataColumn != -1 : false):
                    // when changed some cell context in the first data row we may adaptate new borders to the filter

                    this.isWrited();

                    break;

            }

        }

    }

    isWrited() {
        /*
        reset borders of filtered data when new data is added by resetting the filters
        */

        var searched = new whenIs(this.sheet, null, null, null, this.setted);

        searched.update();

    }

    isCheking() {
        /*
        reset filters by changing option of looking filtered value, example - by project member
        */

        var listUpd = new whenNewYear(this.sheet, "все года", this.setted);

        listUpd.add();

        var filtersetter = new filterSwitcher(this.sheet, this.range.getColumn(), this.value, this.data, this.setted);

        Logger.log(filtersetter);

        Logger.log(filtersetter.init());

        filtersetter.init().reset(this.setted.defItems.indexOf(this.context) === -1, null, null, true, null, this.setted);

    }

}

function filtering(ev) {
    /*
    https://developers.google.com/apps-script/guides/triggers :

    Triggers let Apps Script run a function automatically when a certain event,
    like opening a document, occurs.
    Simple triggers are a set of reserved functions built into Apps Script,
    like the function onOpen(e), which executes when a user opens a Google Docs, Sheets, Slides, or Forms file.
    Installable triggers offer more capabilities than simple triggers but must be activated before use.
    For both types of triggers, Apps Script passes the triggered function an event object that contains
    information about the context in which the event occurred.

    onOpen(e) runs when a user opens a spreadsheet, document, presentation, or form that the user has permission to edit.
    onEdit(e) runs when a user changes a value in a spreadsheet.

    this is onEdit function that callsed from project settings in project editor in Google Workspace
    https://developers.google.com/apps-script/guides/triggers/installable
    https://i0.wp.com/yagisanatode.com/wp-content/uploads/2019/06/Gsuite-Developer-hub-time-trigger-e1559440597640.png?resize=800%2C762&ssl=1
    */

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
    //Returns the currently active spreadsheet, or null if there is none.
    //Functions that are run in the context of a spreadsheet can get a reference to the
    //corresponding Spreadsheet object by calling this function.
    //Gets the active sheet in a spreadsheet.
    //The active sheet in a spreadsheet is the sheet that is being displayed in the spreadsheet UI.

    var range = ev.range;
    var value = ev.value;

    var sheets = ["BOARD_1", "BOARD_2"];
    var listRanges = [[ROW_NUMBER, [COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER]], [ROW_NUMBER, [COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER]]];
    var dataRanges = [[ROW_NUMBER, [COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER]], [ROW_NUMBER, [COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER]]];
    var defItems = ["все месяцы", "все типы проекта", "все типы услуг", "все исполнители", "все года", "все"];
    var ItemsIndex = [[INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER], [INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER]];

    var config = new Settings(sheets, listRanges, dataRanges, defItems, ItemsIndex);

    var Data = new whenSwithcer(sheet, range, value, config);

    Data.init();

}

function reopen() {
    /*
    this is on open function 
    */ 
    
    var sheets = ["BOARD_1", "BOARD_2"];
    var listRanges = [[ROW_NUMBER, [COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER]], [ROW_NUMBER, [COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER]]];
    var dataRanges = [[ROW_NUMBER, [COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER]], [ROW_NUMBER, [COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER, COLUMN_NUMBER]]];
    var defItems = ["TEXT_DROPDOWNLIST_ITEM_DEFAULT_1", "TEXT_DROPDOWNLIST_ITEM_DEFAULT_2", "TEXT_DROPDOWNLIST_ITEM_DEFAULT_3", "TEXT_DROPDOWNLIST_ITEM_DEFAULT_4", "TEXT_DROPDOWNLIST_ITEM_DEFAULT_5", "TEXT_DROPDOWNLIST_ITEM_DEFAULT_6" ];
    var ItemsIndex = [[INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER], [INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER, INDEX_NUMBER]];
    
    var config = new whenOpen( sheets, listRanges, dataRanges, defItems, ItemsIndex );
    
    whenOpen.reopen();

}