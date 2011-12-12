/**
 * Grid控件
 */
(function($) {

var OPT_NAME = "grid-option";
var ROW_DATA = "row-data";
var CELL_DATA = "cell-data";
var CLS_GRID = ".grid";
var CLS_GRID_NAME = "grid";
var COL_MULTISELECT = {
    name: "",
    isMultiCol: true,
    show: true,
    width: 23
};

//..............................................................................
var util = {
    /**
     * 获得配置项
     */
    opt: function(selection) {
        return selection.data(OPT_NAME);
    },
    /**
     * 检查配置项
     */
    checkopt: function(opt) {
        // TODO 检查opt的正确性
        return true;
    },
    /**
     * 获得选区
     */
    selection: function(ele) {
        var me
        if( ele instanceof jQuery) {
            me = ele;
        } else {
            me = $(ele);
        }
        if(me.hasClass(CLS_GRID_NAME))
            return me.parent();
        if(me.children(CLS_GRID).size() > 0)
            return me;
        return me.parents(CLS_GRID).parent();
    },
    /**
     * 计算列宽等信息
     */
    evalColumns: function(opt) {
        util._evalColumnsRawDataAndCellHtml(opt);
        util._evalColumnsWidth(this.boxing(), opt);
    },
    /**
     * 分析列相关函数
     */
    _evalColumnsRawDataAndCellHtml: function(opt) {
        if(true == opt.finishEvalColumnsRC) {
            // 仅计算一次即可
            return;
        }
        var columns = opt.columns;
        var treeCol;
        opt.colMap = {};
        for(var i = 0; i < columns.length; i++) {
            var col = columns[i];
            // 展示文字
            col.oText = z.uname(col.text);
            // 节点的原始数据
            col.getRawData = function(obj) {
                return obj[this.name];
            };
            // cellHtml
            if(!$.isFunction(col.cellHtml)) {
                col.cellHtml = function(obj) {
                    return obj[this.name];
                };
            }
            // 记录map
            opt.colMap[col.name] = col;
            // 判断是不是tree列
            if(true == col.isTreeCol) {
                treeCol = col;
            }
        }
        // 如果可以多选的话，需要加入特殊的一列
        if(true == opt.multiSelect) {
            opt.colMulti = $.extend({}, COL_MULTISELECT);
            opt.colMultiNum = 0;
            opt.colNum = columns.length;
        }
        // 提供一个临时数据存放空间
        opt.tmp = {
            activedRow: null,
            checkedRows: [],
            resizeBorderInfo: {
                left: null,
                right: null
            }
        };
        // 记录排序信息
        opt.sortInfo = {
            colname: null,
            asc: null
        };
        // 是否具有Actived与Checked状态
        if($.isFunction(opt.afterActive) || $.isFunction(opt.beforeActive)) {
            opt.activeMode = true;
        }

        // 如果还有TreeCol的话，Columns需要重新排序
        if(treeCol) {
            var newTreeColumns = [];
            treeCol.show = true;
            newTreeColumns.push(treeCol);
            for(var i = 0; i < columns.length; i++) {
                var col = columns[i];
                if(treeCol.name != col.name) {
                    col.isTreeCol = false;
                    newTreeColumns.push(col);
                }
            }
            opt.columns = newTreeColumns;
            opt.isTreeGrid = true;
        }

        // 没有定义获得孩子节点的方法
        if(opt.getChildren == undefined) {
            opt.getChildren = function(obj) {
                return null;
            }
        }
        opt.finishEvalColumnsRC = true;
    },
    /**
     * 计算每一列的真实宽度
     */
    _evalColumnsWidth: function(box, opt) {
        if(true == opt.finishEvalColumnsWidth) {
            // 仅计算一次即可
            return;
        }
        // 计算参与分配的列，隐藏列不再展示
        var cols = [];
        var columns = opt.columns;
        for(var i = 0; i < columns.length; i++) {
            if(columns[i].show) {
                cols.push(columns[i]);
            }
        }
        // 进行计算,全部单位为百分比
        var max = 100;
        var maxPx = box.width - z.scrollBarWidth();
        // 如果可以多选的话，需要加入特殊的一列
        if(true == opt.multiSelect) {
            var px = opt.colMulti.width;
            var per = Math.floor(px * 100 / box.width);
            max -= per;
            maxPx -= px;
            opt.colMulti.pxWidth = px;
            opt.colMulti.perWidth = per;
            opt.colMulti.realWidth = px + "px";
        }
        var _autos = [];
        var lastCol;
        for(var i = 0; i < cols.length; i++) {
            if(undefined == cols[i].width)
                // 自动分配
                _autos.push(cols[i]);
            else if((cols[i].width + "").indexOf("%") != -1) {
                // 百分比
                var per = parseInt(cols[i].width.substring(0, cols[i].width.indexOf("%")));
                var px = Math.floor(box.width / 100 * per);
                cols[i].perWidth = per;
                cols[i].pxWidth = px;
                max -= per;
                maxPx -= px;
                lastCol = cols[i];
            } else {
                // 数值
                var px = cols[i].width;
                var per = Math.floor(px * 100 / box.width);
                cols[i].perWidth = per;
                cols[i].pxWidth = px;
                max -= per;
                maxPx -= px;
                lastCol = cols[i];
            }
        }
        // 分配自动延伸的列
        if(_autos.length > 0) {
            var each = max > 0 ? Math.floor(max / _autos.length) : 0;
            var eachPx = maxPx > 0 ? Math.floor(maxPx / _autos.length) : 0;
            var rtail = max - each * _autos.length;
            var rtailPx = maxPx - eachPx * _autos.length;
            _autos[0].perWidth = (each + rtail);
            _autos[0].pxWidth = (eachPx + rtailPx);
            for(var i = 1; i < _autos.length; i++) {
                _autos[i].perWidth = each;
                _autos[i].pxWidth = eachPx;
            }
        }
        // 没有自动分配的，max也没有用光
        if(_autos.length == 0 && max > 0) {
            lastCol.perWidth += max;
            lastCol.pxWidth += maxPx;
        }

        // Grid中使用
        for(var i = cols.length - 1; i >= 0; i--) {
            cols[i].realWidth = cols[i].pxWidth + "px";
        }

        opt.finishEvalColumnsWidth = true;
    },
    /**
     * 添加行类
     */
    colclass: function(column) {
        return "cn" + column.name + " " + z.sNull(column.cls);
    },
    /**
     * 获得当前数据的唯一标示
     */
    objId: function(opt, rowData) {
        return opt.getId(rowData);
    },
    /**
     * 获得这个Cell的Html内容
     */
    cellHtml: function(column, rowData) {
        var html = column.cellHtml(rowData) + '';
        return html ? html : "";
    },
    /**
     * 对数据进行排序
     */
    sortDatas: function(opt) {
        // 检查是否有排序信息
        if(opt.sortInfo.colname == null) {
            return;
        }
        // 按照规则进行排序
        var column;
        var name = opt.sortInfo.colname;
        var asc = opt.sortInfo.asc;
        $(opt.columns).each(function(index) {
            if(this.name == name) {
                column = this;
            }
        });
        // 没有比较方法的话，提供一个默认的
        if(!column.compare) {
            column.compare = util._compare;
        }
        // 根据算法，进行排序
        var newRowDatas = util._bubbleSort(opt.localData.rowDatas, column.compare, name);
        opt.localData.rowDatas = asc ? newRowDatas : newRowDatas.reverse();
    },
    /**
     * 默认的排序方法
     */
    _compare: function(cur, next) {
        // TODO 这里比较还不完善,需要改进
        if( typeof cur == 'number') {
            return next < cur;
        } else if( typeof cur == 'string') {
            if(next.length == 0 || cur.length == 0)
                return false;
            return next.localeCompare(cur) < 0;
        } else if( typeof cur == 'date') {
            return Date.parse(next.replace(/-/g, "/")) > Date.parse(cur.replace(/-/g, "/"));
        } else {
            return true;
        }
    },
    /**
     * 冒泡排序
     */
    _bubbleSort: function(arr, compare, name) {//交换排序->冒泡排序
        var temp;
        var exchange;
        for(var i = 0; i < arr.length; i++) {
            exchange = false;
            for(var j = arr.length - 2; j >= i; j--) {
                // if((arr[j + 1]) < (arr[j])) {
                if(compare(arr[j][name], arr[j + 1][name])) {
                    temp = arr[j + 1];
                    arr[j + 1] = arr[j];
                    arr[j] = temp;
                    exchange = true;
                }
            }
            if(!exchange)
                break;
        }
        return arr;
    },
    /**
     * 获得数字型的属性
     */
    getIntAttr: function(obj, attName) {
        return parseInt(obj.attr(attName));
    },
    /**
     * 调用moveTo回调
     */
    moveTo: function(opt, row, newIndex) {
        if($.isFunction(opt.moveTo)) {
            var rowData = row.data(ROW_DATA);
            var oldIndex = util.getIntAttr(row, 'index');
            opt.moveTo.apply(row, [rowData, oldIndex, newIndex]);
        }
    },
    /**
     * column位置移动到目标位置
     */
    colMoveTo: function(opt, myindex, tarindex) {
        var columns = opt.columns;
        var toLast = false;
        if(tarindex == -1) {
            tarindex = columns.length - 1;
            toLast = true;
        }
        var myCol = columns[myindex];
        var newColumns = [];
        var length = columns.length;
        for(var i = 0, j = 1; i < columns.length; i++, j++) {
            var col = columns[i];
            if(i == myindex) {
                continue;
            }
            if(i == tarindex) {
                if(j == length && toLast) {
                    newColumns.push(col);
                    newColumns.push(myCol);
                } else {
                    newColumns.push(myCol);
                    newColumns.push(col);
                }
            } else {
                newColumns.push(col);
            }
        }
        opt.columns = newColumns;
    },
    _redrawBody: function(selection, opt) {
        // 如果有已经被激活的行，需要记录
        dom.recordCheckedAndActivedRows(selection, opt);
        // tbody部分重绘
        dom.redrawBody.apply(selection, [opt]);
        dom.bodyFetchHead(selection);
        // 数据加载
        data.load.apply(selection, [false]);
    },
    findColumn: function(opt, columnName) {
        var columns = opt.columns;
        for(var i = columns.length - 1; i >= 0; i--) {
            if(columns[i].name == columnName) {
                return columns[i];
            }
        }
    }
};

var dom = {
    /**
     * Grid初始化，搭建骨架
     */
    init: function(opt) {
        var gridCls = opt.gridCls ? opt.gridCls : '';
        $('<div class="grid ' + gridCls + '"></div>').appendTo(this);
    },
    /**
     * 列宽改变
     */
    resize: function() {
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var boxWidth = selection.boxing().width - z.scrollBarWidth();
        if(true == opt.multiSelect) {
            boxWidth -= opt.colMulti.width;
        }
        var max = boxWidth;
        var lastCol;
        for(var i = opt.columns.length - 1; i >= 0; i--) {
            var col = opt.columns[i];
            if(col.show) {
                col.pxWidth = Math.floor(boxWidth / 100 * col.perWidth);
                col.realWidth = col.pxWidth + "px";
                max -= col.pxWidth;
                lastCol = col;
            }
        }
        if(max > 0) {
            lastCol.pxWidth += max;
            lastCol.realWidth = lastCol.pxWidth + "px";
        }
    },
    bodyFetchHead: function(selection) {
        var colgrpHeadHtml = $('.grid_head .colgrp_head', selection).html();
        $('.grid_body .colgrp_body', selection).empty().append(colgrpHeadHtml);
    },
    _createTableFun: function(opt) {
        if(opt.fun) {
            // TODO 使用自定义
        } else {
            // 使用默认
            var html = '<div class="grid_fun"><div class="menu_icon"></div></div>';
            html += '<div class="grid_menu">'
            for(var i = 0; i < opt.columns.length; i++) {
                var column = opt.columns[i];
                if(column.isTreeCol) {
                    // TreeCol不能隐藏
                    continue;
                }
                html += '<li class="hidcol"><div class="hidchk"><input type="checkbox" class="ck ' + util.colclass(column) + '" rn="' + i + '"';
                if(column.show) {
                    html += ' checked="checked"'
                }
                html += '><b>' + column.oText.text + '</b></div></li>';
            }
            html += '</div>';
            return html;
        }
    },
    _createTableHead: function(opt) {
        return dom._createTableHtml('head', opt);
    },
    _createTableBody: function(opt) {
        return dom._createTableHtml('body', opt);
    },
    _createTableHtml: function(cls, opt) {
        var html = '<div class="grid_' + cls + '">';
        html += '<table border="0" cellspacing="0" cellpadding="0" width="100%">';
        html += '<colgroup class="colgrp_' + cls + '">';
        if(true == opt.multiSelect) {
            html += '<col class="colwd_" width="' + opt.colMulti.realWidth + '"></col>';
        }
        for(var i = 0; i < opt.columns.length; i++) {
            if(opt.columns[i].show)
                html += '<col class="colwd_' + opt.columns[i].name + '" style="width: ' + opt.columns[i].realWidth + ';" realname="' + opt.columns[i].name + '"></col>';
        }
        html += '</colgroup>';
        html += '<t' + cls + ' class="t' + cls + '"></t' + cls + '>'
        html += '</table></div>';
        return html;
    },
    _drawHead: function(opt) {
        var mul = 0;
        var html = "<tr>";
        if(true == opt.multiSelect) {
            html += '<th  class="grid_col multi_col fixed" fixed="true" sindex="0">';
            html += '<div class="multi multi_head"><input type="checkbox" class="ck" ></div>';
            html += '</th>';
            mul++;
        }
        var length = opt.columns.length;
        var lastColumnName;
        for(var i = 0; i < length; i++) {
            var column = opt.columns[i];
            if(column.show) {
                lastColumnName = column.name;
            }
        }
        for(var i = 0, x = -1; i < length; i++) {
            var column = opt.columns[i];
            if(column.show) {
                x++;
                // 总开关为主
                var resizable = false;
                var orderable = false;
                if(true === opt.resizable) {
                    resizable = true;
                    if(false === column.resizable) {
                        resizable = false;
                    }
                }
                if(true === opt.orderable) {
                    orderable = true;
                    if(false === column.orderable) {
                        orderable = false;
                    }
                }
                html += '<th class="grid_col ' + util.colclass(column) + ' cn' + i + ' ' + (column.isTreeCol ? 'fixed' : 'unfixed');
                html += '" sindex="' + (x + mul) + '" index="' + i + '" realname="' + column.name + '" fixed="' + (column.isTreeCol ? true : false) + '">';
                if(lastColumnName == column.name || !resizable) {
                    html += '<span class="grid_th_noresize grid_resize gr' + x + '"  num="' + x + '">&nbsp;&nbsp;</span>';
                } else {
                    html += '<span class="grid_th_resize grid_resize gr' + x + '" num="' + x + '">&nbsp;&nbsp;</span>';
                }
                if(orderable) {
                    html += '<span class="grid_sort" realname="' + column.name + '"><span class="grid_sort_asc"></span><span class="grid_sort_desc"></span></span>';
                    html += '<div class="grid_th grid_th_sort">';
                } else {
                    html += '<div class="grid_th grid_th_nosort">';
                }
                html += '<span class="grid_colname" realname="' + column.name + '" fixed="' + (column.isTreeCol ? true : false) + '">' + column.oText.text + '</span>';
                html += '</div></th>';
            }
        }
        html += "</tr>";
        return html;
    },
    _drawBody: function(opt, deep, rowDatas, parentObjId) {
        if(!deep) {
            deep = 0;
        }
        if(!rowDatas) {
            rowDatas = opt.localData.rowDatas;
        }
        var html = '';
        for(var i = 0; i < rowDatas.length; i++) {
            var rowData = rowDatas[i];
            var objId = util.objId(opt, rowData);
            html += '<tr class="grid_row rn' + i + ' rnobj' + objId + ' dep' + deep;
            if(parentObjId) {
                html += ' prt' + parentObjId + '"' + ' parentObjId="' + parentObjId + '"';
            } else {
                html += '"';
            }
            html += ' rownum="' + i + '" deep="' + deep + '" objId="' + objId + '">';
            if(true == opt.multiSelect) {
                html += '<td  class="grid_col multi_col">';
                html += '<div class="multi"><input type="checkbox" class="ck" ></div>';
                html += '</td>';
            }
            // 根据数据进行判断
            var childrenData = opt.getChildren(rowData);
            var hasChildren = false;
            if($.isArray(childrenData) && childrenData.length > 0) {
                hasChildren = true;
            }
            // Cell
            for(var x = 0; x < opt.columns.length; x++) {
                var column = opt.columns[x];

                if(column.isTreeCol) {
                    // TreeCol需要添加一个小箭头
                    html += '<td class="grid_col ' + util.colclass(column) + " cn" + x + '" colnum="' + x + '" cnm="' + column.name + '">';
                    html += '<span class="grid_colname">';
                    for(var y = 0; y < deep; y++) {
                        html += '<i class="icon tree_place"></i>';
                    }
                    if(hasChildren) {
                        if(true == rowData.hasOpen) {
                            html += '<i class="icon tree_node tree_folder_open"></i>';
                        } else {
                            html += '<i class="icon tree_node tree_folder"></i>';
                        }
                    } else {
                        html += '<i class="icon tree_file"></i>';
                    }
                    html += util.cellHtml(column, rowData) + '</span></td>';
                    continue;
                }
                if(column.show) {
                    html += '<td class="grid_col ' + util.colclass(column) + " cn" + x + '" colnum="' + x + '" cnm="' + column.name + '">';
                    html += '<span class="grid_colname">' + util.cellHtml(column, rowData) + '</span>';
                    html += '</td>';
                }
            }
            // 判断是否已经打开，如果打开的话需要子节点编写
            if(hasChildren && true == rowData.hasOpen) {
                html += dom._drawBody(opt, deep + 1, childrenData, objId);
            }
            html += "</tr>";
        }
        return html;
    },
    redraw: function(opt) {
        var selection = this;
        // 清空整个Grid
        selection.empty();
        // 搭骨架
        dom.init.apply(selection, [opt]);
        // 表头
        dom.redrawHead.apply(selection, [opt]);
        // 表体
        dom.redrawBody.apply(selection, [opt]);
    },
    redrawHead: function(opt) {
        var selection = this;
        // 计算列宽等信息
        util.evalColumns.apply(selection, [opt]);
        // 去掉表头
        $('.grid .grid_fun', selection).remove();
        $('.grid .grid_menu', selection).remove();
        $('.grid .grid_head', selection).remove();
        // 绘制表头
        $('.grid', selection).prepend(dom._createTableFun(opt) + dom._createTableHead(opt));
        // 一定要先调整ScrollWidth
        layout.adjustScollWidth.apply(selection, []);
        // 填充表头
        $('.grid .thead', selection).append(dom._drawHead(opt));
    },
    redrawBody: function(opt) {
        var selection = this;
        // 去掉表体
        $('.grid .grid_body', selection).remove();
        // 绘制表体
        $('.grid', selection).append(dom._createTableBody(opt));
        // 调整高度
        layout.adjustBodyHeight.apply(selection, []);
    },
    /**
     * 选中当前行
     */
    checkAndActiveRow: function(opt, row, addClss) {
        dom.changRowStatus(opt, row, addClss ? addClss : ['check_row', 'active_row'], null);
    },
    /**
     * 取消当前行
     */
    uncheckAndUnactiveRow: function(opt, row, delClss) {
        dom.changRowStatus(opt, row, null, delClss ? delClss : ['check_row', 'active_row']);
    },
    /**
     * 改变行状态
     */
    changRowStatus: function(opt, row, addClss, delClss) {
        if($.isArray(addClss) && addClss.length > 0) {
            $.each(addClss, function(index, addCls) {
                row.addClass(addCls);
            });
        }
        if($.isArray(delClss) && delClss.length > 0) {
            $.each(delClss, function(index, delCls) {
                row.removeClass(delCls);
            });
        }
    },
    /**
     * 改变checkbox的状态
     */
    changeCkbStatus: function(opt, selection) {
        // 多选总开关
        if(true == opt.multiSelect) {
            // 取消所有的
            $('.grid_body .tbody .multi .ck', selection).attr('checked', null);
            var multiHead = $('.grid_head .multi_head .ck', selection);
            multiHead.attr('checked', null);
            // 选中所有check状态的
            var ckRows = $('.grid_body .tbody .check_row .multi .ck', selection);
            ckRows.attr('checked', 'checked');
            if(ckRows.length == $('.grid_body .tbody .grid_row', selection).length) {
                multiHead.attr('checked', 'checked');
            }
        }
    },
    /**
     * 还原排序状态
     */
    recoverSortCol: function(opt) {
        var sortInfo = opt.sortInfo;
        var selection = this;
        if(sortInfo.colname != null) {
            var sort = $('.grid_head .cn' + sortInfo.colname + ' .grid_sort', selection);
            if(sort.length > 0) {
                sort.addClass('active_sort');
                if(sortInfo.asc) {
                    sort.children().first().addClass('sort_show');
                } else {
                    sort.children().last().addClass('sort_show');
                }
            }
        }
    },
    /**
     * 记录当前Grid中Checked与Actived状态的数据
     */
    recordCheckedAndActivedRows: function(selection, opt) {
        var activedRow = $('.tbody .active_row', selection);
        var checkedRows = $('.tbody .check_row', selection);
        if(activedRow.length > 0) {
            opt.tmp.activedRow = $(activedRow[0]).attr('objid');
        }
        if(checkedRows.length > 0) {
            $.each(checkedRows, function(index, checkedRow) {
                opt.tmp.checkedRows.push($(checkedRow).attr('objid'));
            });
        }
    },
    /**
     * 恢复当前Grid中Checked与Actived状态的数据
     */
    recoverCheckedAndActivedRows: function(selection, opt) {
        if(opt.tmp.activedRow != null) {
            $('.tbody .rnobj' + opt.tmp.activedRow, selection).addClass('active_row');
        }
        if(opt.tmp.checkedRows.length > 0) {
            $.each(opt.tmp.checkedRows, function(index, checkedRow) {
                $('.tbody .rnobj' + checkedRow, selection).addClass('check_row');
            });
            dom.changeCkbStatus(opt, selection);
        }
        dom.clearCheckedAndActivedRows(opt);
    },
    /**
     * 清除当前Grid中Checked与Actived状态的数据
     */
    clearCheckedAndActivedRows: function(opt) {
        opt.tmp.activedRow = null;
        opt.tmp.checkedRows = [];
    },
    /**
     * 更新每一行的Index值
     */
    updateRowIndex: function(selection, opt) {
        var allRows = $('.grid_body .tbody .grid_row', selection);
        for(var i = 0; i < allRows.length; i++) {
            $(allRows[i]).attr('index', i);
        }
    },
    /**
     * 添加读取画面
     */
    addLoading: function() {
        var selection = this;
        var html = '<div class="grid_loading"><div><b>Loading...</b></div></div>'
        $('.grid_body', selection).prepend(html);
    },
    /**
     * 取消读取画面
     */
    removeLoading: function() {
        var selection = this;
        if($('.grid_body .grid_loading', selection).length > 0) {
            $('.grid_body .grid_loading', selection).fadeOut("slow", function() {
                $(this).remove();
            });
        }
    }
};

var data = {
    /**
     * 保存当前GridBody中的数据到LocalData
     */
    saveCurrentRowsToLocalData: function(tBody) {
        var newRowDatas = [];
        tBody.children().each(function(index, row) {
            newRowDatas.push($(row).data(ROW_DATA));
        });
        var selection = util.selection(tBody);
        var opt = util.opt(selection);
        opt.localData.rowDatas = newRowDatas;
    },
    /**
     * 加载数据
     */
    load: function(useGetData) {
        var selection = this;
        var opt = util.opt(selection);
        // 使用getData方法获取数据
        if(useGetData) {
            // 读取中
            dom.addLoading.apply(selection, []);
            if( typeof opt.getData == "object") {
                // 数据
                opt.localData = opt.getData;
            } else if($.isFunction(opt.getData)) {
                // 方法
                opt.localData = opt.getData.apply(selection);
            } else {
                // 错误
                throw "$.fn.grid: opt.getData is invalid";
            }
        }

        // 有数据的情况下
        if( typeof opt.localData == "object") {
            // 填充数据进行绑定
            data._fillGridBodyAndBind.apply(selection, []);
        }
    },
    /**
     * 数据排序，填充，绑定，选中项选中
     */
    _fillGridBodyAndBind: function() {
        var selection = this;
        var opt = util.opt(selection);
        // 读取完毕
        dom.removeLoading.apply(selection, []);
        // 恢复排序信息
        dom.recoverSortCol.apply(selection, [opt]);
        // 数据排序
        util.sortDatas(opt);
        // 填充数据
        $('.grid_body .tbody', selection).append(dom._drawBody(opt));
        data.bind.apply(selection, [opt]);
        // 还原页面数据选中状态
        dom.recoverCheckedAndActivedRows(selection, opt);
        // 更新Index
        dom.updateRowIndex(selection, opt);
    },
    /**
     * 对Grid上的每一行，每一个Cell，绑定对应的数据
     */
    bind: function(opt) {
        var tBody = $('.tbody', this);
        data._deepBind(opt.localData.rowDatas, opt, tBody);
    },
    /**
     * 深层绑定
     */
    _deepBind: function(rowDatas, opt, selection) {
        var bindSomeRow = false;
        for(var i = rowDatas.length - 1; i >= 0; i--) {
            var rowData = rowDatas[i];
            var row = $('.rnobj' + util.objId(opt, rowData), selection);
            // 绑定本身
            if(row.length > 0 && (row.data(ROW_DATA) == null || row.data(ROW_DATA) == undefined)) {
                row.data(ROW_DATA, rowData);
                for(var x = opt.columns.length - 1; x >= 0; x--) {
                    var column = opt.columns[x];
                    var cell = $(".cn" + column.name, row);
                    if(cell) {
                        cell.data(CELL_DATA, column.getRawData(rowData));
                    }
                }
                bindSomeRow = true;
            }
            // 深层绑定
            var childrenData = opt.getChildren(rowData);
            if(row.data(ROW_DATA) && $.isArray(childrenData) && childrenData.length > 0) {
                var bindChildren = data._deepBind(childrenData, opt, selection);
                if(bindChildren) {
                    // rowData需要一个标记表示打开
                    rowData.hasOpen = true;
                }
            }
        }
        return bindSomeRow;
    },
    /**
     * 解除绑定，消除dom元素
     */
    unbind: function(rowDatas, opt, selection) {
        for(var i = rowDatas.length - 1; i >= 0; i--) {
            var rowData = rowDatas[i];
            var row = $('.rnobj' + util.objId(opt, rowData), selection);
            // 先删除孩子
            var childrenData = opt.getChildren(rowData);
            if(row.length > 0 && $.isArray(childrenData) && childrenData.length > 0) {
                data.unbind(childrenData, opt, selection);
                // rowData需要一个标记表示打开
                rowData.hasOpen = false;
            }
            // 再删除自己
            if(row.length > 0) {
                row.removeData(ROW_DATA);
                row.remove();
            }
        }
    }
};

var layout = {
    /**
     * 调整Grid非表头部分的高度
     */
    adjustBodyHeight: function() {
        // 调整tbody部分的高度
        $(".grid_body", this).height(this.boxing().height - $(".grid_head", this).boxing().height);
    },
    /**
     * 根据滚动条宽度进行微调
     */
    adjustScollWidth: function() {
        var scrollBarWidth = z.scrollBarWidth();
        $('.grid_head', this).css('paddingRight', scrollBarWidth);
        $('.grid_fun', this).css('width', scrollBarWidth);
        $('.grid_fun .menu_icon', this).css('width', scrollBarWidth);
    }
};

var commands = {
    /**
     * 绘制Grid
     */
    draw: function(opt) {
        var selection = this;
        // 配置项绑定
        selection.data(OPT_NAME, opt);
        // 绘制Grid
        dom.redraw.apply(selection, [opt]);
        // 事件绑定
        events.bind.apply(selection, []);
        // 加载数据
        data.load.apply(selection, [true]);
    },
    /**
     * 作废整个Grid
     */
    depose: function() {
        var selection = this;
        events.unbind.apply(selection);
        selection.removeData(OPT_NAME);
        $(CLS_GRID, selection).remove();
    },
    /**
     * 重绘整个Grid,保存当前状态
     */
    redraw: function() {
        var selection = util.selection(this);
        var opt = util.opt(selection);
        // 保存当前页面状态
        dom.recordCheckedAndActivedRows(selection, opt);
        // 重绘Grid
        dom.redraw.apply(selection, [opt]);
        // 加载数据
        data.load.apply(selection, [false]);
    },
    /**
     * 改变Grid大小
     */
    resize: function() {
        var selection = util.selection(this);
        // 宽按比例缩放
        dom.resize.apply(selection, [])
        // 重绘Grid
        commands.redraw.apply(selection, []);
    },
    /**
     * 重新调用getData方法加载数据
     */
    reload: function() {
        var selection = this;
        var opt = util.opt(this);
        // 清空数据
        $('.grid_body .tbody', selection).empty();
        // 加载数据
        data.load.apply(selection, [true]);
    },
    /**
     * 加载数据，一般是getData方法中作为回调使用
     */
    load: function(datas) {
        var selection = this;
        var opt = util.opt(selection);
        opt.localData = datas;
        // 填充数据进行绑定
        data._fillGridBodyAndBind.apply(selection, []);
    },
    /**
     * 获取Cell
     */
    getCell: function(rnOrId, cnOrName) {
        var row;
        var cell;
        var selection = util.selection(this);
        if(( typeof rnOrId == 'number' || typeof rnOrId == 'string') && ( typeof cnOrName == 'number' || typeof cnOrName == 'string')) {
            var rn;
            if( typeof rnOrId == 'number') {
                rn = '.rn' + rnOrId;
            } else {
                rn = '.rnobj' + rnOrId;
            }
            row = $('.grid_body .tbody ' + rn, selection);
            if(row && row.length > 0) {
                cell = $('.cn' + cnOrName, row);
                if(cell && cell.length > 0) {
                    return cell;
                }
            }
        }
    },
    /**
     * 获取CellData
     */
    getCellData: function(rnOrId, cnOrName) {
        var cell = commands.getCell.apply(this, [rnOrId, cnOrName]);
        if(cell) {
            return cell.data(CELL_DATA);
        }
    },
    /**
     * 获取CellData
     */
    setCellData: function(rnOrId, cnOrName, cellData) {
        var selection = this;
        var opt = util.opt(selection);
        var cell = commands.getCell.apply(selection, [rnOrId, cnOrName]);
        if(cell) {
            // 数据
            var columnName = cell.attr('cnm');
            var column = util.findColumn(opt, columnName);
            var rowData = cell.parent().data(ROW_DATA);
            rowData[columnName] = cellData;
            // html显示
            cell.data(CELL_DATA, cellData);
            cell.empty();
            cell.append('<span class="grid_colname">' + util.cellHtml(column, rowData) + '</span>');
            return true;
        }
        return false;
    },
    /**
     * 获得当前的列配置信息
     */
    getOptColumns: function() {
        var selection = this;
        var opt = util.opt(selection);
        return opt.columns;
    },
    /**
     * 获得显示字符
     */
    getColShowText: function(cn) {
        var selection = this;
        var column = commands._getColumn.apply(selection, [cn]);
        if(column) {
            return column.oText.text;
        }
    },
    /**
     * 获得显示名称
     */
    getColText: function(cn) {
        var selection = this;
        var column = commands._getColumn.apply(selection, [cn]);
        if(column) {
            return column.text;
        }
    },
    /**
     * 获得实际名称
     */
    getColName: function(cn) {
        var selection = this;
        var column = commands._getColumn.apply(selection, [cn]);
        if(column) {
            return column.name;
        }
    },
    _getColumn: function(cn) {
        if( typeof cn == 'number') {
            var selection = this;
            var opt = util.opt(selection);
            var cols = $('.grid_head .thead th', selection);
            if(cn <= cols.length - 1) {
                var col = $(cols[cn]);
                var colName = col.attr('realname');
                return util.findColumn(opt, colName);
            }
        }
    },
    getColData: function(cnOrName) {
        if( typeof cnOrName == 'number' || typeof cnOrName == 'string') {
            var selection = this;
            var opt = util.opt(selection);
            var cells = $('.grid_body .tbody .grid_row .cn' + cnOrName, selection);
            if(cells.length > 0) {
                var colDatas = [];
                $.each(cells, function(index, cell) {
                    colDatas.push($(cell).data(CELL_DATA));
                });
                return colDatas;
            }
        }
    },
    /**
     * 获得指定行
     */
    getRow: function(rnOrId) {
        var row;
        var selection = util.selection(this);
        if( typeof rnOrId == 'number' || typeof rnOrId == 'string') {
            var rn;
            if( typeof rnOrId == 'number') {
                rn = '.rn' + rnOrId;
            } else {
                rn = '.rnobj' + rnOrId;
            }
            row = $('.grid_body .tbody ' + rn, selection);
            if(row && row.length > 0) {
                return row;
            }
        }
    },
    /**
     * 获得激活行
     */
    getActiveRow: function() {
        var selection = util.selection(this);
        var arr = selection.find('.grid_body .tbody .active_row');
        if(arr.length > 0) {
            return arr.first();
        }
    },
    /**
     * 获得选中行
     */
    getCheckedRow: function() {
        var selection = util.selection(this);
        var arr = selection.find('.grid_body .tbody .check_row');
        if(arr.length > 0) {
            return arr;
        }
    },
    /**
     * 获得数据
     */
    getData: function(jqObj, mode) {
        if(jqObj) {
            if(mode === "row") {
                return jqObj.data(ROW_DATA);
            } else if(mode === "cell") {
                return jqObj.data(CELL_DATA);
            }
        }
    },
    /**
     * 获取指定的行数据
     */
    getRowData: function(rnOrId) {
        var selection = util.selection(this);
        var row = commands.getRow.apply(selection, [rnOrId]);
        if(row) {
            return row.data(ROW_DATA);
        }
    },
    /**
     * 获取激活行数据
     */
    getActiveRowData: function() {
        var selection = util.selection(this);
        var row = commands.getActiveRow.apply(selection, []);
        if(row) {
            return row.data(ROW_DATA);
        }
    },
    /**
     * 获取选中行数据
     */
    getCheckedRowData: function() {
        var selection = util.selection(this);
        var rows = commands.getCheckedRow.apply(selection, []);
        if(rows) {
            var checkedDatas = [];
            $.each(rows, function(index, row) {
                checkedDatas.push($(row).data(ROW_DATA));
            });
            return checkedDatas;
        }
    },
    /**
     * 更新指定的行数据
     */
    setRowData: function(rnOrId, rowData) {
        var oldRowData;
        var selection = util.selection(this);
        var opt = util.opt(selection);
        if( typeof rnOrId == 'number' || typeof rnOrId == 'string') {
            oldRowData = commands.getRowData.apply(selection, [rnOrId]);
        } else if( typeof rnOrId == 'object') {
            rowData = rnOrId;
            var rowDatas = opt.localData.rowDatas;
            var objId = util.objId(opt, rowData);
            for(var i = 0; i < rowDatas.length; i++) {
                if(objId == util.objId(opt, rowDatas[i])) {
                    oldRowData = rowDatas[i];
                    break;
                }
            }
        }
        if(oldRowData) {
            var oldObjId = util.objId(opt, oldRowData);
            $.extend(oldRowData, rowData);
            // 更新tbody中的数据
            var row = $('.grid_body .tbody .rnobj' + oldObjId, selection);
            for(var i = opt.columns.length - 1; i >= 0; i--) {
                var column = opt.columns[i];
                var cell = $('.cn' + column.name + ' .grid_colname', row);
                if(cell) {
                    cell.html(util.cellHtml(column, oldRowData));
                }
            }
            return true;
        }
        return false;
    },
    /**
     * 根据行号或唯一ID激活某行
     */
    activeRow: function(rnOrId) {
        var row;
        var selection = util.selection(this);
        var opt = util.opt(selection);
        if( typeof rnOrId == 'number' || typeof rnOrId == 'string') {
            var rn;
            if( typeof rnOrId == 'number') {
                rn = '.rn' + rnOrId;
            } else {
                rn = '.rnobj' + rnOrId;
            }
            row = $('.grid_body .tbody ' + rn, selection);
        }
        // 判断，激活
        if(row && row.length > 0) {
            row.click();
            return row;
        }
    },
    /**
     * 根据行号或唯一ID取消某行激活状态
     */
    deactiveRow: function(rnOrId) {
        var row;
        var selection = util.selection(this);
        var opt = util.opt(selection);
        if( typeof rnOrId == 'number' || typeof rnOrId == 'string') {
            var rn;
            if( typeof rnOrId == 'number') {
                rn = '.rn' + rnOrId;
            } else {
                rn = '.rnobj' + rnOrId;
            }
            row = $('.grid_body .tbody ' + rn, selection);
        } else {
            row = $('.grid_body .tbody .active_row', selection);
        }
        // 判断，激活
        if(row && row.length > 0 && row.hasClass('active_row')) {
            dom.uncheckAndUnactiveRow(opt, row);
            if(opt.multiSelect == true) {
                dom.changeCkbStatus(opt, selection);
            }
            return row;
        }
    },
    /**
     * 根据行号或唯一ID选中某行
     */
    checkRow: function(rnOrId) {
        var row;
        var selection = util.selection(this);
        var opt = util.opt(selection);
        if(opt.multiSelect == true) {
            if( typeof rnOrId == 'number' || typeof rnOrId == 'string') {
                var rn;
                if( typeof rnOrId == 'number') {
                    rn = '.rn' + rnOrId;
                } else {
                    rn = '.rnobj' + rnOrId;
                }
                row = $('.grid_body .tbody ' + rn, selection);
            } else if($.isArray(rnOrId)) {
                var rnOrIds = rnOrId;
                $.each(rnOrIds, function(index, ri) {
                    commands.checkRow.apply(selection, [ri]);
                });
            }
            // 判断，激活
            if(row && row.length > 0 && !row.hasClass('check_row')) {
                dom.checkAndActiveRow(opt, row, ['check_row']);
                dom.changeCkbStatus(opt, selection);
                return row;
            }
        }
    },
    /**
     * 根据行号或唯一ID不选中某行
     */
    uncheckRow: function(rnOrId) {
        var row;
        var selection = util.selection(this);
        var opt = util.opt(selection);
        if(opt.multiSelect == true) {
            if( typeof rnOrId == 'number' || typeof rnOrId == 'string') {
                var rn;
                if( typeof rnOrId == 'number') {
                    rn = '.rn' + rnOrId;
                } else {
                    rn = '.rnobj' + rnOrId;
                }
                row = $('.grid_body .tbody ' + rn, selection);
            } else if($.isArray(rnOrId)) {
                var rnOrIds = rnOrId;
                $.each(rnOrIds, function(index, ri) {
                    commands.uncheckRow.apply(selection, [ri]);
                });
            }
            // 判断，激活
            if(row && row.length > 0 && row.hasClass('check_row')) {
                dom.uncheckAndUnactiveRow(opt, row);
                dom.changeCkbStatus(opt, selection);
                return row;
            }
        }
    },
    /**
     * 选中所有行
     */
    checkAllRow: function() {
        var selection = util.selection(this);
        var opt = util.opt(selection);
        if(opt.multiSelect == true) {
            var rows = $('.grid_body .tbody .grid_row', selection);
            dom.checkAndActiveRow(opt, rows, ['check_row']);
            dom.changeCkbStatus(opt, selection);
        }
    },
    /**
     * 取消选中所有行
     */
    uncheckAllRow: function() {
        var selection = util.selection(this);
        var opt = util.opt(selection);
        if(opt.multiSelect == true) {
            var rows = $('.grid_body .tbody .grid_row', selection);
            dom.uncheckAndUnactiveRow(opt, rows);
            dom.changeCkbStatus(opt, selection);
        }
    },
    /**
     * 某一行移动到某一个位置
     */
    moveTo: function(rowIndex, newIndex) {
        if( typeof rowIndex == "object") {
            rowIndex = util.getIntAttr(rowIndex, 'index');
        }
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var num = $('.grid .grid_body .tbody', selection).children().length;
        var maxIndex = num - 1;
        if(rowIndex < 0 || newIndex < 0 || rowIndex > maxIndex || newIndex > maxIndex || rowIndex == newIndex) {
            return false;
        }
        var moveStep = rowIndex - newIndex;
        var down = moveStep < 0;
        moveStep = down ? moveStep * -1 : moveStep;
        if(down) {
            return commands.down.apply(selection, [rowIndex, moveStep]);
        } else {
            return commands.up.apply(selection, [rowIndex, moveStep]);
        }
    },
    /**
     * 行向上移动一行
     */
    up: function(rowIndex, moveStep) {
        if( typeof rowIndex == "object") {
            rowIndex = util.getIntAttr(rowIndex, 'index');
        }
        return commands._up.apply(this, [rowIndex, (rowIndex - ( moveStep ? moveStep : 1))]);
    },
    /**
     * 行向下移动一行
     */
    down: function(rowIndex, moveStep) {
        if( typeof rowIndex == "object") {
            rowIndex = util.getIntAttr(rowIndex, 'index');
        }
        return commands._down.apply(this, [rowIndex, (rowIndex + ( moveStep ? moveStep : 1))]);
    },
    /**
     * 行向上移动顶部
     */
    top: function(rowIndex) {
        if( typeof rowIndex == "object") {
            rowIndex = util.getIntAttr(rowIndex, 'index');
        }
        return commands._up.apply(this, [rowIndex, 0]);
    },
    /**
     * 行向下移动到底部
     */
    bottom: function(rowIndex) {
        if( typeof rowIndex == "object") {
            rowIndex = util.getIntAttr(rowIndex, 'index');
        }
        return commands._down.apply(this, [rowIndex]);
    },
    _up: function(rowIndex, newIndex) {
        if(rowIndex <= 0) {
            return false;
        }
        if(newIndex <= 0) {
            newIndex = 0;
        }
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var row = commands.getRow.apply(selection, [rowIndex]);
        var trow = commands.getRow.apply(selection, [newIndex]);
        if(row) {
            util.moveTo(opt, row, newIndex);
            trow.before(row);
            data.saveCurrentRowsToLocalData($('.grid .tbody', selection));
            util._redrawBody(selection, opt);
            return true;
        }
        return false;
    },
    _down: function(rowIndex, newIndex) {
        var maxIndex = $('.grid .grid_body .tbody', selection).children().length - 1;
        var selection = util.selection(this);
        var opt = util.opt(selection);
        if(rowIndex >= maxIndex) {
            return false;
        }
        newIndex = newIndex ? newIndex : maxIndex;
        if(newIndex >= maxIndex) {
            newIndex = maxIndex;
        }
        var row = commands.getRow.apply(selection, [rowIndex]);
        var trow = commands.getRow.apply(selection, [newIndex]);
        if(row) {
            util.moveTo(opt, row, newIndex);
            trow.after(row)
            data.saveCurrentRowsToLocalData($('.grid .tbody', selection));
            util._redrawBody(selection, opt);
            return true;
        }
        return false;
    }
};

var events = {
    /**
     * 绑定事件
     */
    bind: function() {
        var selection = this;
        var opt = util.opt(selection);
        // 行单击
        selection.delegate(".grid_body .tbody .grid_row", "click", events.clickRow);
        // 行多选
        if(opt.multiSelect === true) {
            selection.delegate(".grid_body .tbody .multi", "click", events.checkRow);
            selection.delegate(".grid_head .thead .multi_head", "click", events.checkAllRow);
        }
        // TreeGrid的Folder事件
        if(opt.isTreeGrid === true) {
            selection.delegate('.grid_body .tbody .grid_row .tree_folder', 'click', events.openFolder);
            selection.delegate('.grid_body .tbody .grid_row .tree_folder_open', 'click', events.closeFolder);
        }

        // 列隐藏
        if(opt.hideCols === true) {
            selection.delegate(".grid_fun", "click", events.showColMenu);
            selection.delegate(".grid_menu .ck", "click", events.hiddenColumn);
            selection.delegate(".grid_menu .hidcol", "click", events.hiddenColumnByName);
        }
        // 列排序
        if(opt.orderable === true) {
            selection.delegate(".grid_head .thead .grid_th_sort", "click", events.sortClick);
        }
        // 列宽改变
        if(opt.resizable === true) {
            selection.delegate(".grid_head .thead .grid_th_resize", "mousedown", events.onResizeMouseDown);
        }

        // 行上下拖动
        if(opt.rowDD === true) {
            selection.delegate(".grid_body .tbody .grid_row .grid_col", "mousedown", events.onRowDragMouseDown);
        }
        // 列左右拖动
        if(opt.colDD === true) {
            selection.delegate(".grid_head .thead .grid_th", "mousedown", events.onColDragMouseDown);
        }
    },
    /**
     * 取消绑定事件
     */
    unbind: function() {
        this.undelegate();
    },
    onColDragMouseDown: function(e) {
        e.stopPropagation();
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var cCol = $(this).parent();
        var fixed = cCol.hasClass('fixed');
        if(fixed) {
            return false;
        }
        var colDragInfo = {
            selection: selection,
            y: e.pageY,
            x: e.pageX,
            cCol: cCol
        }
        opt.colDragInfo = colDragInfo;
        // 绑定鼠标事件
        $(document).bind('mousemove', events.onColDragMouseMove).bind('mouseup', events.onColDragMouseUp);
        $(document).data('opt-tmp', opt);
        return false;
    },
    onColDragMouseMove: function(e) {
        e.stopPropagation();
        var doc = $(this);
        var opt = doc.data('opt-tmp');
        var colDragInfo = opt.colDragInfo;
        var selection = colDragInfo.selection;
        if(colDragInfo.stop == true) {
            return false;
        }
        // 第一次移动，绘制拖动层
        if(!colDragInfo.move) {
            var gridDivBox = $('.grid', selection).boxing();
            var divHeigth = gridDivBox.height;
            var divWidth = gridDivBox.width - z.scrollBarWidth();
            var cCol = colDragInfo.cCol;
            var cColName = cCol.attr('realname');
            // 绘制判断层
            var allCols = $('.grid_head .thead th', selection);
            var noDDWidth = 0;
            var colGrp = $('.grid_head .colgrp_head', selection).children();
            var moveHtml = '';
            var cColNext = false;
            var moveToWidth = 32;
            var last;
            for(var i = 0, j = 1; i < allCols.length; i++, j++) {
                var aCol = $(allCols[i]);
                last = j == allCols.length;
                if(aCol.hasClass('fixed')) {
                    noDDWidth += $(colGrp[util.getIntAttr(aCol, 'sindex')]).width();
                } else {
                    var aColName = aCol.attr('realname');
                    if(aColName == cColName) {
                        var wucha = 0;
                        if(last) {
                            wucha += moveToWidth / 2;
                        } else if(i == 0) {
                            wucha += -(moveToWidth / 2);
                        }
                        moveHtml += '<div class="coldragging_moveover coldragging_move fixed" style="width:' + ($(colGrp[util.getIntAttr(aCol, 'sindex')]).width() + wucha) + 'px"></div>';
                        cColNext = true;
                    } else {
                        if(cColNext) {
                            moveHtml += '<div class="coldragging_moveover coldragging_move" style="width:' + $(colGrp[util.getIntAttr(aCol, 'sindex')]).width() + 'px"></div>';
                            cColNext = false;
                        } else {
                            moveHtml += '<div class="coldragging_moveto coldragging_move" style="width:' + moveToWidth + 'px" realname="' + aColName + '"><div class="show_position"></div></div>';
                            moveHtml += '<div class="coldragging_moveover coldragging_move" style="width:' + ($(colGrp[util.getIntAttr(aCol, 'sindex')]).width() - moveToWidth) + 'px"></div>';
                        }
                        if(last) {
                            moveHtml += '<div class="coldragging_moveto coldragging_move" style="width:' + (moveToWidth / 2 ) + 'px"><div class="show_position"></div></div>';
                        }
                    }
                }
            };
            // 判断是否没有可以移动的地方
            var stopWidth = noDDWidth + $(colGrp[util.getIntAttr(cCol, 'sindex')]).width();
            colDragInfo.stopWidth = stopWidth;
            if(stopWidth == divWidth) {
                colDragInfo.stop = true;
                return false;
            }
            var pHtml = '<div class="coldragging_bottom"><div class="container">';
            if(noDDWidth > 0) {
                pHtml += '<div class="coldragging_moveover coldragging_move" style="width:' + (noDDWidth - (moveToWidth / 2)) + 'px"></div>';
            };
            pHtml += moveHtml;
            pHtml += '</div></div>';
            $('.grid', selection).prepend(pHtml);
            // 调整第一个moveTo
            var dms = $('.grid .coldragging_bottom .coldragging_move', selection);
            var firstMove = dms.first();
            var lastMove = dms.last();
            if(firstMove.hasClass('coldragging_moveto')) {
                firstMove.width((moveToWidth / 2 ));
            }
            if(lastMove.hasClass('coldragging_moveto')) {
                lastMove.children().first().css({
                    left: 8,
                    right: null
                });
            }
            var coldraggingBottom = $('.grid .coldragging_bottom', selection);
            coldraggingBottom.css({
                width: divWidth,
                height: divHeigth
            });
            // helper层
            var dhHtml = '<div class="dragging_helper">';
            dhHtml += '<span><b>' + $('.grid_colname', cCol).html() + '</b></span>';
            dhHtml += '</div>';
            $('.grid', selection).append(dhHtml);
            var helper = $('.dragging_helper', selection);
            helper.css({
                height: 24,
                left: colDragInfo.x + 15,
                top: colDragInfo.y + 5
            });
            // col这一列 打阴影 特殊显示
            var maskColHtml = '<div class="mask_col"></div>';
            $('.grid', selection).append(maskColHtml);
            var maskCol = $('.mask_col', selection);
            maskCol.css({
                left: cCol.offset().left - $('.grid', selection).offset().left,
                width: $(colGrp[util.getIntAttr(cCol, 'sindex')]).width()
            });
            // 记录
            colDragInfo.coldraggingBottom = coldraggingBottom;
            colDragInfo.helper = helper;
            colDragInfo.maskCol = maskCol;
            colDragInfo.move = true;
        }
        // 绘制完毕后，移动开始
        // help随鼠标移动
        var down = y - colDragInfo.y > 0;
        var y = e.pageY;
        var x = e.pageX;
        var top = parseInt(colDragInfo.helper.css('top').substring(0, colDragInfo.helper.css('top').indexOf("p")));
        var left = parseInt(colDragInfo.helper.css('left').substring(0, colDragInfo.helper.css('left').indexOf("p")));
        colDragInfo.helper.css({
            top: top + (y - colDragInfo.y),
            left: left + (x - colDragInfo.x)
        });
        colDragInfo.y = y;
        colDragInfo.x = x;
        // 取消高亮
        colDragInfo.coldraggingBottom.children().first().children().removeClass('coldragging_active');
        // .children().hide();
        // 计算鼠标是否落在了draggingBottom上
        var positionDiv = document.elementFromPoint(e.pageX, e.pageY);
        var pdJq = $(positionDiv);
        if(positionDiv && pdJq.hasClass('coldragging_moveto')) {
            // 添加高亮
            var moveDiv = pdJq;
            moveDiv.addClass('coldragging_active');
            // 暂时不使用小箭头
            // moveDiv.children().first().show();
        } else {
        }
    },
    onColDragMouseUp: function(e) {
        e.stopPropagation();
        var doc = $(this);
        var opt = doc.data('opt-tmp');
        var colDragInfo = opt.colDragInfo;
        var selection = colDragInfo.selection;
        if(colDragInfo.stop) {
            // 暂时没有处理
        }
        if(colDragInfo.move) {
            // 查看是否有活动的位置
            var changed = false;
            var colActives = $('.grid .coldragging_bottom .container .coldragging_active', selection);
            if(colActives.length > 0) {
                changed = true;
                var colAc = $(colActives[0]);
                var realname = colAc.attr('realname');
                var cCol = colDragInfo.cCol;
                var aCol = $('.grid_head .thead th.cn' + realname, selection);
                var tarindex = -1;
                var myindex = util.getIntAttr(cCol, 'index');
                // Columns位置移动,然后重绘调用重绘
                if(realname) {
                    tarindex = util.getIntAttr(aCol, 'index');
                }
                util.colMoveTo(opt, myindex, tarindex);
            }
            colDragInfo.coldraggingBottom.remove();
            colDragInfo.helper.remove();
            colDragInfo.maskCol.remove();
            if(changed) {
                // 重绘Grid
                commands.redraw.apply(selection, []);
            }
        }
        $(document).unbind('mousemove').unbind('mouseup');
        $(document).removeData('opt-tmp');
        opt.colDragInfo = null;
    },
    onRowDragMouseDown: function(e) {
        e.stopPropagation();
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var cell = $(this);
        // 多选时，ckb不能拖动
        if(cell.attr('cnm') == null || cell.attr('cnm') == undefined) {
            return false;
        }
        // 该行没有check的情况下不能拖动
        var row = cell.parent();
        if(!row.hasClass('check_row')) {
            return false;
        }
        // 因为可能是拖动，也可能是点击，所以这里不做处理，放到鼠标移动中
        var dragInfo = {
            selection: selection,
            cRow: row,
            y: e.pageY,
            x: e.pageX
        };
        opt.dragInfo = dragInfo;
        // 绑定鼠标事件
        $(document).bind('mousemove', events.onRowDragMouseMove).bind('mouseup', events.onRowDragMouseUp);
        $(document).data('opt-tmp', opt);
        return false;
    },
    onRowDragMouseMove: function(e) {
        e.stopPropagation();
        var doc = $(this);
        var opt = doc.data('opt-tmp');
        var dragInfo = opt.dragInfo;
        var selection = dragInfo.selection;
        // TODO TreeGrid暂时不考虑
        if(opt.isTreeGrid == true) {
            return false;
        }
        // 如果是选择了所有的列，不能再拖动了
        if(dragInfo.stop) {
            return false;
        }
        // 第一次移动，绘制拖动层
        if(!dragInfo.move) {
            // 计算要拖动的层
            var cRow = dragInfo.cRow;
            var cRowIndex = util.getIntAttr(cRow, 'index');
            // 选中所有check的层
            var allRows = $('.grid_row', cRow.parent());
            var showRows = [];
            var hiddenRows = [];
            for(var i = 0; i < allRows.length; i++) {
                var row = $(allRows[i]);
                if(row.hasClass('check_row')) {
                    hiddenRows.push(row);
                } else {
                    showRows.push(row);
                }
            }
            // 如果所有的列都被选中的话
            if(hiddenRows.length == allRows.length) {
                // 鼠标指针变成stop
                dragInfo.stop = true;
                // 鼠标添加一个式样
                $('.grid_body .tbody tr', selection).addClass('stopDragging');
                return false;
            }
            // 记录数量
            dragInfo.shos = showRows;
            dragInfo.hids = hiddenRows;
            dragInfo.rowNum = allRows.length;
            dragInfo.shoNum = showRows.length;
            dragInfo.hidNum = hiddenRows.length;
            // 因为可能没有移动，要刷新，所以记录下check
            dom.recordCheckedAndActivedRows(selection, opt);
            // 将选中的列，放到一个单独的div中，这样Grid中的斑马线才能正常显示
            var hidHtml = '<div class="dragging_hid"></div>';
            $('.grid_body', selection).append(hidHtml);
            var hidDiv = $('.grid_body .dragging_hid', selection);
            for(var i = 0; i < hiddenRows.length; i++) {
                // 隐藏效果
                hiddenRows[i].addClass('dragging_row');
                hiddenRows[i].hide();
                hidDiv.append(hiddenRows[i]);
            }
            // 计算宽度高度
            var rowBox = showRows[0].boxing();
            var tableBox = showRows[0].parent().boxing();
            var rowHeight = rowBox.height;
            var rowWidth = rowBox.width;
            var divHeight = tableBox.height;
            var divWidth = tableBox.width;
            var movetoHeight = Math.floor((rowHeight - 16) / 2);
            var moveinHeight = rowHeight - (movetoHeight * 2);
            dragInfo.rowWidth = rowWidth;
            dragInfo.rowHeight = rowHeight;
            dragInfo.divHeight = divHeight;
            dragInfo.divWidth = divWidth;
            // 绘制判断层
            var pHtml = '<div class="dragging_bottom" >';
            for(var i = 0; i < showRows.length; i++) {
                var sRow = showRows[i];
                pHtml += '<div class="dragging_moveto dragging_move" index="' + i + '"><div class="green_line"></div></div>';
                pHtml += '<div class="dragging_movein dragging_move" index="' + i + '"></div>';
            }
            pHtml += '<div class="dragging_moveto dragging_move" index="' + showRows.length + '"><div class="green_line"></div></div>';
            pHtml += '</div>';
            // 调整宽高
            $('.grid_body', selection).append(pHtml);
            var draggingBottom = $('.dragging_bottom', selection);
            draggingBottom.css({
                width: divWidth
            });
            $('.dragging_bottom .dragging_moveto', selection).css({
                height: movetoHeight * 2
            });
            $('.dragging_bottom .dragging_moveto', selection).first().css({
                height: movetoHeight
            });
            $('.dragging_bottom .dragging_movein', selection).css({
                height: moveinHeight
            });
            $('.dragging_bottom .dragging_moveto .green_line', selection).css({
                left: 0,
                bottom: movetoHeight - 1
            });
            // 绘制示意层
            var dhHtml = '<div class="dragging_helper">';
            dhHtml += '<span><b>选中' + hiddenRows.length + '条数据</b></span>';
            dhHtml += '</div>';
            $('.grid_body', selection).append(dhHtml);
            var helper = $('.dragging_helper', selection);
            helper.css({
                height: 24,
                left: dragInfo.x + 15,
                top: dragInfo.y - 15
            });
            // 记录
            dragInfo.helper = helper;
            dragInfo.draggingBottom = draggingBottom;
            dragInfo.hidDiv = hidDiv;
            // 记录已经拖动过了
            dragInfo.move = true;
        }
        // 绘制完毕后，移动开始
        // help随鼠标移动
        var down = y - dragInfo.y > 0;
        var y = e.pageY;
        var x = e.pageX;
        var top = parseInt(dragInfo.helper.css('top').substring(0, dragInfo.helper.css('top').indexOf("p")));
        var left = parseInt(dragInfo.helper.css('left').substring(0, dragInfo.helper.css('left').indexOf("p")));
        dragInfo.helper.css({
            top: top + (y - dragInfo.y),
            left: left + (x - dragInfo.x)
        });
        dragInfo.y = y;
        dragInfo.x = x;
        // 取消高亮
        dragInfo.draggingBottom.children().removeClass('dragging_active');
        // 取消下面的列选中
        $('.grid_body .tbody', selection).children().removeClass('check_row');
        // 计算鼠标是否落在了draggingBottom上
        var positionDiv = document.elementFromPoint(e.pageX, e.pageY);
        var pdJq = $(positionDiv);
        if(positionDiv && pdJq.hasClass('dragging_move')) {
            // 添加高亮
            var moveDiv = pdJq;
            moveDiv.addClass('dragging_active');
            if(moveDiv.hasClass('dragging_movein')) {
                // 如果不是TreeGrid
                if(opt.isTreeGrid == true) {
                    // TODO 暂时不处理
                } else {
                    // 取消高亮,底下的row会亮起
                    moveDiv.removeClass('dragging_active');
                    var index = util.getIntAttr(moveDiv, 'index');
                    var iRow = $($('.grid_body .tbody', selection).children()[index]);
                    iRow.addClass('check_row');
                }
            } else {
                // 没什么可做的
            }
        } else {
            // TODO 鼠标移动到Grid边缘时，如果有滚动条，自行滚动
        }
    },
    onRowDragMouseUp: function(e) {
        e.stopPropagation();
        var doc = $(this);
        var opt = doc.data('opt-tmp');
        var dragInfo = opt.dragInfo;
        var selection = dragInfo.selection;
        // 鼠标添加一个式样
        if(dragInfo.stop) {
            $('.grid_body .tbody tr', selection).removeClass('stopDragging');
        }
        // 判断是否移动了
        if(opt.dragInfo.move) {
            // 移动的话，调整Grid，调整数据
            var activeMoveDivs = $('.dragging_active', dragInfo.draggingBottom);
            if(activeMoveDivs.length > 0) {
                var amd = activeMoveDivs.first();
                if(amd.hasClass('dragging_moveto')) {
                    var index = util.getIntAttr(amd, 'index');
                    events._moveRow(opt, dragInfo, index);
                } else {
                    // TODO TreeGrid处理
                }
                // check与Active信息记录没有用到
                dom.clearCheckedAndActivedRows(opt);
            } else {
                // 没有移动，所有行回到原来的位置
                // 从hidDiv中把row放回GridBody中
                var tbody = $('.grid_body .tbody', selection);
                dragInfo.hidDiv.children().each(function(index, item) {
                    tbody.append($(item));
                })
            }
            // 取消绑定与CSS样式
            $('.grid_body .dragging_row', selection).removeClass('dragging_row');
            dragInfo.helper.remove();
            dragInfo.draggingBottom.remove();
            dragInfo.hidDiv.remove();
        }
        $(document).unbind('mousemove').unbind('mouseup');
        $(document).removeData('opt-tmp');
        opt.dragInfo = null;
        // 没有了动画效果,但保证了index的正确性, TODO
        util._redrawBody(selection, opt);
    },
    _moveRow: function(opt, dragInfo, index) {
        // 这里需要修改两个地方，一个是Grid，一个是localData
        var showRows = dragInfo.shos;
        var hiddenRows = dragInfo.hids;
        var cRow = showRows[index];
        var newIndex = index;
        var tBody = showRows[0].parent();
        if(cRow) {
            $.each(hiddenRows, function(i, hidRow) {
                util.moveTo(opt, hidRow, newIndex);
                cRow.before(hidRow);
                hidRow.fadeIn("slow");
                newIndex++;
            });
        } else {
            $.each(hiddenRows, function(i, hidRow) {
                util.moveTo(opt, hidRow, newIndex);
                tBody.append(hidRow);
                hidRow.fadeIn("slow");
                newIndex++;
            });
        }
        // 数据的话，不再判断
        data.saveCurrentRowsToLocalData(tBody);
    },
    /**
     * 展开当前文件夹中的Tree
     */
    openFolder: function(e) {
        e.stopPropagation();
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var icon = $(this);
        var row = icon.parents('.grid_row');
        var nextDeep = util.getIntAttr(row, 'deep') + 1;
        icon.removeClass('tree_folder').addClass('tree_folder_open');
        // 查找子节点数据
        var rowData = row.data(ROW_DATA);
        var childrenRowDatas = opt.getChildren(rowData);
        var newRowsHtml = dom._drawBody(opt, nextDeep, childrenRowDatas, util.objId(opt, rowData));
        row.after(newRowsHtml);
        data.bind.apply(selection, [opt]);
        // 多选模式下，判断全选的checkbox
        dom.changeCkbStatus(opt, selection);
        // 更新Index
        dom.updateRowIndex(selection, opt);
    },
    /**
     * 关闭当前文件夹中的Tree
     */
    closeFolder: function(e) {
        e.stopPropagation();
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var icon = $(this);
        var row = icon.parents('.grid_row');
        icon.removeClass('tree_folder_open').addClass('tree_folder');
        // 查找子节点数据
        var rowData = row.data(ROW_DATA);
        var childrenRowDatas = opt.getChildren(rowData);
        var tBody = $('.tbody', selection);
        data.unbind(childrenRowDatas, opt, tBody);
        // 多选模式下，判断全选的checkbox
        dom.changeCkbStatus(opt, selection);
        // 最外层需要自己记录
        rowData.hasOpen = false;
        // 更新Index
        dom.updateRowIndex(selection, opt);
    },
    /**
     * 排序
     */
    sortClick: function(e) {
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var sort = $(this).parent().children('.grid_sort');
        var asc = true;
        // 图标显示
        if(sort.hasClass('active_sort')) {
            sort.children().each(function(index) {
                var item = $(this);
                if(item.hasClass('sort_show')) {
                    item.removeClass('sort_show');
                } else {
                    item.addClass('sort_show');
                    if(index == 1) {
                        asc = false;
                    }
                }
            });
        } else {
            // 其他所有的排序图标隐藏
            $('.thead .active_sort', selection).removeClass('active_sort').children().removeClass('sort_show');
            sort.addClass('active_sort');
            sort.children().first().addClass('sort_show');
        }
        // 记录排序信息
        opt.sortInfo.colname = sort.attr('realname');
        opt.sortInfo.asc = asc;
        // 如果有已经被激活的行，需要记录
        dom.recordCheckedAndActivedRows(selection, opt);
        // tbody部分重绘
        dom.redrawBody.apply(selection, [opt]);
        dom.bodyFetchHead(selection);
        // 数据加载
        data.load.apply(selection, [false]);
        return false;
    },
    /**
     * 选中某行
     */
    checkRow: function(e) {
        e.stopPropagation();
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var row = $(this).parents('.grid_row').first();
        if(!row.hasClass('check_row')) {
            dom.checkAndActiveRow(opt, row, ['check_row']);
        } else {
            dom.uncheckAndUnactiveRow(opt, row);
        }
        dom.changeCkbStatus(opt, selection);
    },
    /**
     * 选中所有行
     */
    checkAllRow: function(e) {
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var ckb = $('.ck', this);
        var ck = ckb.attr('checked');
        var allRows = $('.grid_body .grid_row', selection);
        if(ck == undefined) {
            dom.uncheckAndUnactiveRow(opt, allRows);
        } else {
            dom.checkAndActiveRow(opt, allRows, ['check_row']);
        }
        dom.changeCkbStatus(opt, selection);
    },
    /**
     * 单击某行
     */
    clickRow: function(e) {
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var row = $(this);
        var rowData = row.data(ROW_DATA);
        var ckRows = row.parent().find('.check_row');
        // 多选模式下
        if(true == opt.multiSelect) {
            // 如果 ctrl 键被按下
            if(window.keyboard.ctrl) {
                // 取消其他行的激活效果
                dom.uncheckAndUnactiveRow(opt, ckRows, ['active_row']);
                if(row.hasClass("check_row")) {
                    dom.uncheckAndUnactiveRow(opt, row);
                } else {
                    dom.checkAndActiveRow(opt, row);
                }
                dom.changeCkbStatus(opt, selection);
                return;
            }
            // 如果 shift 键被按下，则会试图一起多选
            if(window.keyboard.shift) {
                // 取消其他行的选中效果
                dom.uncheckAndUnactiveRow(opt, ckRows, ['check_row']);
                var act = row.parent().children(".active_row");
                // 之前没有选中的项目
                if(act.size() == 0) {
                    dom.checkAndActiveRow(opt, row);
                } else {
                    // 判断一下在前在后
                    if(act.prevAll().size() > row.prevAll().size()) {// 在我后面
                        row.nextUntil(act[0]).add(this).add(act).addClass("check_row");
                    } else if(act.prevAll().size() < row.prevAll().size()) {// 在我前面
                        row.prevUntil(act[0]).add(this).add(act).addClass("check_row");
                    } else {//选中了同一个
                        dom.checkAndActiveRow(opt, row);
                    }
                }
                dom.changeCkbStatus(opt, selection);
                return;
            }
        }

        // 已经选中了多个的情况下
        if(ckRows.length > 1) {
            // 取消其他行的选中效果
            dom.uncheckAndUnactiveRow(opt, ckRows);
        }

        if(!row.hasClass('check_row')) {
            // 取消其他行的选中效果
            dom.uncheckAndUnactiveRow(opt, ckRows);
            // beforeActive
            if($.isFunction(opt.beforeActive)) {
                opt.beforeActive.apply(row, [rowData]);
            }
            dom.checkAndActiveRow(opt, row);
            // afterActive
            if($.isFunction(opt.afterActive)) {
                opt.afterActive.apply(row, [rowData]);
            }
        }
        dom.changeCkbStatus(opt, selection);
    },
    /**
     * 显示隐藏列选择菜单
     */
    showColMenu: function(e) {
        e.stopPropagation();
        $('.menu_icon', this).toggle();
        var menuDiv = $(this).parent().find('.grid_menu');
        menuDiv.toggle();
        if(menuDiv.is(':visible')) {
            // 绑定个一次性事件
            $(document).one('click', function(e) {
                var menuDiv = $('.grid_menu', this);
                if(menuDiv.is(':visible')) {
                    $('.grid_fun .menu_icon', this).click();
                }
            });
        }
    },
    /**
     * 通过点击ck旁边的名字引发隐藏功能
     */
    hiddenColumnByName: function(e) {
        var ckb = $('.ck', this);
        var ck = ckb.attr('checked');
        if(ck == undefined) {
            ckb.attr('checked', 'checked');
        } else {
            ckb.attr('checked', null);
        }
        events.hiddenColumn.apply(ckb, [e]);
    },
    /**
     * 隐藏列
     */
    hiddenColumn: function(e) {
        e.stopPropagation();
        var selection = util.selection(this);
        var ckb = $(this);
        var index = util.getIntAttr(ckb, 'rn');
        var checked = ckb.attr('checked') != undefined;
        var opt = util.opt(selection);
        var curCol = opt.columns[index];
        curCol['show'] = checked;
        // 不能全部隐藏
        var allHidden = true;
        for(var i = opt.columns.length - 1; i >= 0; i--) {
            if(opt.columns[i].show) {
                allHidden = false;
                break;
            }
        }
        if(allHidden) {
            ckb.attr('checked', 'checked');
            opt.columns[index]['show'] = !checked;
            alert(z.msg('err.grid.allhidden'));
            return;
        }
        // 计算新的列宽
        var showCol = events._findPrevShowColumn(index, opt.columns);
        if(showCol === false) {
            showCol = events._findNextShowColumn(index, opt.columns);
        }
        if(checked) {// 显示一列
            // 平分列宽
            var each = Math.floor(showCol.perWidth / 2);
            var rtail = showCol.perWidth - each * 2;
            showCol.perWidth = each;
            curCol.perWidth = each + rtail;

            var eachPx = Math.floor(showCol.pxWidth / 2);
            var rtailPx = showCol.pxWidth - eachPx * 2;
            showCol.pxWidth = eachPx;
            curCol.pxWidth = eachPx + rtailPx;

            showCol.realWidth = showCol.pxWidth + "px";
            curCol.realWidth = curCol.pxWidth + "px";
        } else {// 隐藏一列
            // 合并列宽
            showCol.perWidth = showCol.perWidth + curCol.perWidth;
            showCol.pxWidth = showCol.pxWidth + curCol.pxWidth;

            showCol.realWidth = showCol.pxWidth + "px";
        }
        // 直接调用redraw
        commands.redraw.apply(selection, []);
        // FIXME 这里需要做点脏事 chrome safari下发现 隐藏列显示时，如果没有列排序的话，可能会造成看上去表头表体没有对齐
        $('.grid_fun', selection).click();
    },
    _findPrevShowColumn: function(index, columns) {
        for(var i = index - 1; i >= 0; i--) {
            if(columns[i].show) {
                return columns[i];
            }
        }
        return false;
    },
    _findNextShowColumn: function(index, columns) {
        for(var i = index + 1; i < columns.length; i++) {
            if(columns[i].show) {
                return columns[i];
            }
        }
        return false;
    },
    /**
     * 列宽改变，鼠标按下时
     */
    onResizeMouseDown: function(e) {
        // 计算左右可以移动到的边界位置
        var selection = util.selection(this);
        var opt = util.opt(selection);
        var curRB = $(this);
        var num = util.getIntAttr(curRB, 'num');
        var minSize = 50;
        var borderInfo = {
            minSize: minSize,
            tWidth: null,
            left: null,
            right: null,
            cCG: null,
            rCG: null,
            cCol: null,
            rCol: null
        };
        // 左边
        if(num == 0) {
            borderInfo.left = $('.grid', selection).offset().left + minSize;
            if(true == opt.multiSelect) {
                borderInfo.left += opt.colMulti.width;
            }
        } else {
            borderInfo.left = $('.grid .grid_head .gr' + (num - 1), selection).offset().left + minSize;
        }
        // 右边
        var rtRB = $('.grid .grid_head .gr' + (num + 1), selection);
        borderInfo.right = rtRB.offset().left - minSize;
        // 多选需+1
        if(true == opt.multiSelect) {
            num++;
        }
        // 对应的两个colgroup
        var cgHead = $('.grid .grid_head .colgrp_head', selection).children();
        borderInfo.cCG = $(cgHead[num]);
        borderInfo.rCG = $(cgHead[num + 1]);
        var cgBody = $('.grid .grid_body .colgrp_body', selection).children();
        borderInfo.cCol = $(cgBody[num]);
        borderInfo.rCol = $(cgBody[num + 1]);
        // 两个块总长度
        borderInfo.tWidth = borderInfo.cCG.width() + borderInfo.rCG.width();
        // opt临时记录
        opt.tmp.resizeBorderInfo = borderInfo;
        // 绑定鼠标事件
        $(document).bind('mousemove', events.onResizeMouseMove).bind('mouseup', events.onResizeMouseUp);
        $(document).data('opt-tmp', opt);
        // 鼠标样式绑定
        $('head').append('<style> * {cursor: col-resize;} .grid_th_sort {cursor: col-resize;} .thead .grid_col {cursor: col-resize;}</style>')
        // 防止选中文字
        return false;
    },
    /**
     * 列宽改变，鼠标移动时
     */
    onResizeMouseMove: function(e) {
        var opt = $(document).data('opt-tmp');
        var borderInfo = opt.tmp.resizeBorderInfo;
        var relativeX = e.pageX;
        // 判断位置是否超出了边界值
        if(relativeX > borderInfo.left && relativeX < borderInfo.right) {
            var x = relativeX - borderInfo.left + borderInfo.minSize;
            borderInfo.cCG.width(x);
            borderInfo.rCG.width(borderInfo.tWidth - borderInfo.cCG.width());

            borderInfo.cCol.width(x);
            borderInfo.rCol.width(borderInfo.tWidth - borderInfo.cCG.width());
        }
    },
    /**
     * 列宽改变，鼠标抬起时
     */
    onResizeMouseUp: function(e) {
        // 记录当前的宽度
        var opt = $(document).data('opt-tmp');
        var borderInfo = opt.tmp.resizeBorderInfo;
        // 重新计算两者的所占百分比
        var cCol = opt.colMap[borderInfo.cCG.attr('realname')];
        var rCol = opt.colMap[borderInfo.rCG.attr('realname')];

        var max = cCol.perWidth + rCol.perWidth;
        var maxPx = cCol.pxWidth + rCol.pxWidth;

        var cColNewPer = Math.floor(cCol.perWidth * borderInfo.cCG.width() / cCol.pxWidth);
        cCol.perWidth = cColNewPer;
        cCol.pxWidth = borderInfo.cCG.width();

        rCol.perWidth = max - cCol.perWidth;
        rCol.pxWidth = maxPx - cCol.pxWidth;

        cCol.realWidth = cCol.pxWidth + "px";
        rCol.realWidth = rCol.pxWidth + "px";

        // TODO 解决表头与表体的1px的误差，将表头的列宽copy到表体中
        var selection = util.selection(borderInfo.cCG);
        dom.bodyFetchHead(selection);

        // 取消绑定与CSS样式
        $(document).unbind('mousemove').unbind('mouseup');
        $(document).removeData('opt-tmp');
        $('head').children().last().remove();
    }
};

$.fn.extend({
    // 预留5个参数位置，理论上不会更多了
    grid: function(opt, arg0, arg1, arg2, arg3, arg4) {
        if( typeof opt == "object") {// 初始化模式
            var selection = this;
            // 检查有效选区
            if(selection.size() == 0)
                throw "$.fn.grid: unknown selection '" + selection.selector + "'";
            // 检查opt正确性
            if(!util.checkopt(opt))
                throw "$.fn.grid: opt has some problems";
            // 调用绘制Grid命令
            commands.draw.apply(selection, [opt]);
        } else if( typeof opt == "string") {// 命令模式
            if('function' != typeof commands[opt])
                throw "$.fn.grid don't support command '" + opt + "'";
            if(util.opt(this))
                return commands[opt].apply(this, [arg0, arg1, arg2, arg3, arg4]);
        }
    }
});

})(window.jQuery)