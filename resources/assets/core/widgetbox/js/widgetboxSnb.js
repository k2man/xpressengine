;(function(exports, WidgetBox) {
    'use strict';

    exports.WidgetSnb = (function() {
        var self;
        var _settings = {
            mode: 'desktop',
            divisionType: '6|6',
            divisionMap: {},
            order: 0
        };
        var _deletable = true;

        return {
            init: function() {
                self = this;
                self.cache();
                self.bindEvents();
                self.settings();

                return this;
            },
            cache: function() {
                self.$editor = $(".editor");
                self.$selectDivision = $("#selectDivision");
                self.$btnDivision = $(".btnDivision");
                self.$btnMode = $(".widget-snb .btnMode");
                self.$divisionTypeView = $("#divisionTypeView");
                self.$btnAddRow = $("#btnAddRow");
                self.$btnDeselectAll = $("#btnDeselectAll");
                self.$btnDelBlock = $("#btnDelBlock");
                self.$btnWidgetAdd = $(".btn-widget-add");
                self.$inputVerticalSize = $("#inputVerticalSize");
                self.$btnAddDivisionType = $("#btnAddDivisionType");
                self.$tooltips = $('[data-toggle="xe-tooltip"]');
                self.$sectionClose = $(".btn-section-close");

            },
            bindEvents: function() {
                self.$btnMode.on("click", self.selectMode);
                self.$selectDivision.on("click", "li > a", self.selectDivisionType);
                self.$btnDivision.on('click', self.divide);
                self.$btnAddRow.on('click', self.addRow);
                self.$btnDeselectAll.on("click", WidgetBox.deselectAll);
                self.$btnDelBlock.on("click", self.removeBlock);
                self.$btnWidgetAdd.on("click", self.toggleWidgetAddLayer);
                self.$inputVerticalSize.on("keypress", self.inputVerticalSize);
                self.$btnAddDivisionType.on("click", self.addDivisionType);
                self.$sectionClose.on("click", self.toggleSection);
            },
            settings: function() {
                var locDivitionType = JSON.parse(localStorage.getItem("divisionType") || '[]');
                var appendDivision = [];

                self.$selectDivision.find("a[data-type]").each(function() {
                    var type = $(this).data("type");

                    _settings.divisionMap[type] = '';
                });

                locDivitionType.forEach(function(v) {
                    if(!_settings.divisionMap.hasOwnProperty(v)) {
                        appendDivision.push(v);
                    }
                });

                self.appendDivisionType(appendDivision);

                //tooltip
                // self.$tooltips.xeTooltip();
            },
            toggleSection: function() {
                var $section = $(this).parents(".seciton");

                $section.children(".section-group").toggle();
                $section.toggleClass("close");
            },
            addDivisionType: function() {
                var divisionType = self.$inputVerticalSize.val();

                if(divisionType === '') {
                    window.alert("추가할 수직분할 형태를 입력하세요.");
                    return;
                }else if(divisionType){

                    var validType = true;
                    var division = "";

                    if(/^[1-9 ]+$/g.test(divisionType)) {
                        var cells = divisionType.split(" ");
                        var sum = 0;

                        cells.forEach(function(v, i) {
                            sum += parseInt(v);

                            division += parseInt(v);

                            if(i !== (cells.length - 1)) {
                                division += "|";
                            }
                        });

                        if(sum !== 12) {
                            validType = false;
                        }
                    }else {
                        validType = false;
                    }

                    if(!validType) {
                        window.alert("수직분할 형태는 [1 ~ 12]의 숫자와 스페이스로 입력하고\n 분할셀의 총 합은 12가 되어야 합니다.");
                    }else {
                        var locDivitionType = JSON.parse(localStorage.getItem("divisionType") || '[]');

                        if($.inArray(division, locDivitionType) === -1) {
                            locDivitionType.push(division);
                            localStorage.setItem("divisionType", JSON.stringify(locDivitionType));

                            self.appendDivisionType([division]);
                        }else {
                            window.alert("이미 추가한 분할타입입니다. [" + division.replace(/\|/g, " ") + "]");
                        }
                    }

                }
            },
            appendDivisionType: function(types) {

                var html = "";

                types.forEach(function(v) {
                    var display = v.replace(/\|/g, ":");

                    var spans = "";
                    display.split(":").forEach(function(v, i) {
                        spans += '<span class="xe-col-xs-' + v + '"><em>' + v + '</em></span>';
                    });

                    //TODO span 160px기준 col-1 당 13px 임시로..
                    html += [
                        '<li>',
                            '<a href="#" data-type="' + v + '" data-display="' + display + '">',
                                spans,
                            '</a>',
                        '</li>'
                    ].join("\n");
                });

                self.$selectDivision.append(html);
            },
            inputVerticalSize: function(e) {
                if(e.keyCode === 13) {
                    self.addDivisionType();
                }
            },
            toggleWidgetAddLayer: function(command, index) {
                // close sidebar
                if (!$('.widget-layer').hasClass("open")) {

                    if ($(".selected").length > 0) {

                        //TODO :: 언어
                        if(command === 'modify') {
                            WidgetAdder.$btnPlaceWidget.data('index', index).text('수정');
                        }else {
                            WidgetAdder.$btnPlaceWidget.text('추가');
                        }

                        $(".widget-layer").addClass("open");
                        $(".dimd").show();
                        $("body").css("overflow", "hidden");

                    } else {
                        window.alert("위젯을 추가할 셀을 선택하세요.");

                    }
                } else {
                    $("aside").removeClass("open");
                }
            },
            selectMode: function() {
                var $this = $(this),
                    mode = $this.data("mode");

                $this.addClass('xe-btn-primary').parent().siblings().find(".xe-btn").removeClass('xe-btn-primary');

                if(mode === 'mobile') {
                    //layout-mobile
                    
                    self.$editor.addClass("layout-mobile");
                }else {
                    self.$editor.removeClass("layout-mobile");
                }
                
                _settings.mode = mode;
            },
            selectDivisionType: function() {
                var $this = $(this);

                self.$divisionTypeView.text($this.data("display"));

                _settings.divisionType = $this.data("type");

                self.divideVertical();
            },
            divide: function() {
                var direction = $(this).data("direction"); //horizontal or vertical
                var $selected = $(".selected");

                if($selected.find(".widgetarea .widget").length > 0) {
                    window.alert("위젯을 추가한 셀은 분할될 수 없습니다.");
                    return;

                }else {
                    switch(direction) {
                        case 'vertical' :
                            self.divideVertical();
                            break;

                        case 'horizontal' :
                            self.divideHorizontal();
                            break;

                        default:
                            window.console.error("type error.");
                    }
                }
            },
            divideVertical: function() {
                var columns = _settings.divisionType.split("|"),
                    $selected = $(".selected"),
                    $target = $selected.closest(".widgetarea-row"),
                    html = "";

                if($selected.length > 0) {
                    var height = $selected.find(".widgetarea").height();

                    $target.removeClass("widgetarea-row");
                    $selected.remove();

                    columns.forEach(function(v, i) {
                        html += [
                            '<div class="xe-col-md-' + v + '">',
                                '<div class="xe-row widgetarea-row">',
                                    '<div class="xe-col-md-12">',
                                        '<div class="widgetarea" data-height="' + height + '" style="height:' + height + 'px">',
                                            '<span class="order"></span>',
                                        '</div>',
                                    '</div>',
                                '</div>',
                            '</div>'
                        ].join("\n");
                    });

                    $target.html(html);

                    WidgetBox.deselectAll();
                    WidgetBox.setOrdering();
                }
            },
            divideHorizontal: function() {
                var $selected = $(".selected"),
                    $widgetAreaRow = $selected.parents(".widgetarea-row");

                if($selected.length > 0) {
                    $widgetAreaRow.after([
                        '<div class="xe-row widgetarea-row">',
                            '<div class="xe-col-md-12">',
                                '<div class="widgetarea" data-height="140" style="height:140px">',
                                    '<span class="order"></span>',
                                '</div>',
                            '</div>',
                        '</div>',
                    ].join("\n"));

                    if($selected.find(".widgetarea").height() > 140) {
                        var height = ($selected.find(".widgetarea").height() - 25) / 2,
                            $wdigetareaRow = $selected.parents(".widgetarea-row"),
                            selectedHeight = $wdigetareaRow.find(".widgetarea").height();

                        $wdigetareaRow.find(".widgetarea").setHeight(140);

                        if((selectedHeight - 165) > 140) {
                            $wdigetareaRow.next().find(".widgetarea").setHeight(selectedHeight - 165);
                        }else {

                            var wHeight = $wdigetareaRow.next().find(".widgetarea").height();
                            $wdigetareaRow.next().find(".widgetarea").setHeight(wHeight);
                        }

                    }else {
                        var $cols = $widgetAreaRow.parents("div[class^='xe-col-']").siblings();

                        $cols.each(function() {
                            var $this = $(this);

                            $this.find(".widgetarea-row").parent().find(".widgetarea-row:last").each(function() {
                                var $this = $(this),
                                    $lastTarget = $this.find(".widgetarea:last"),
                                    height = $lastTarget.height() + 165;

                                $lastTarget.setHeight(height);
                            });
                        });
                    }

                    WidgetBox.deselectAll();
                    WidgetBox.setOrdering();
                }
            },
            addRow: function() {
                self.$editor.append([
                    '<div class="xe-row widgetarea-row">',
                        '<div class="xe-col-md-12">',
                            '<div class="widgetarea" data-height="140" style="height:140px">',
                                '<span class="order"></span>',
                            '</div>',
                        '</div>',
                    '</div>'
                ].join("\n"));
            },
            removeBlock: function() {

                var $selected = $(".selected"),
                    $selectedParentRow = $selected.parents(".widgetarea-row"),
                    $siblingsRow = $selectedParentRow.siblings(),
                    $selectedParentCol = $selectedParentRow.closest("div[class^='xe-col-']"),
                    $lastColumn = $selectedParentCol.siblings(":last");

                if($selected.find(".widgetarea .widget").length > 0) {
                    window.alert("위젯을 추가한 셀은 삭제될 수 없습니다.");
                    return;
                }

                if(self.$editor.find(".widgetarea").length === 1) {
                    window.console.error("삭제될수 없음");
                    return;
                }

                if($siblingsRow.length > 0) {


                    var deletable = self.checkRowBlock($selected);
                    var $target = $();

                    if(deletable) {

                        var height = $selected.find(".widgetarea").height();

                        $(".editor > .xe-row:has(.selected)").find(".widgetarea-row:last-child:not(:has(.selected))").not($(".selected").closest(".widgetarea-row").siblings()).each(function() {
                            var $lastWidgetareaRow = $(this),
                                $widgetarea = $lastWidgetareaRow.find(".widgetarea"),
                                lastWidgetareaRowHeight = $widgetarea.height();

                            if(lastWidgetareaRowHeight > height) {
                                var resetHeight = lastWidgetareaRowHeight - height - 25;

                                $widgetarea.setHeight(resetHeight);
                            }
                        });

                        $selectedParentRow.remove();

                    }else {

                        //주변의 블럭과 합쳐줘야함.
                        /**
                         * 1)next확인
                         * 2)prev확인
                         * 3)row, col 확인
                         * 4)row라면 last row에 있는 컬럽을 늘림
                         * 5)col이라면 col하위의 last row의 col을 늘림
                         * */
                        var targetHeight = $selected.find(".widgetarea").height();

                        if($selectedParentRow.siblings().length > 0) {
                            var $combineRow = ($selectedParentRow.next().length > 0)? $selectedParentRow.next() : $selectedParentRow.prev();

                            $selectedParentRow.remove();

                            if($combineRow.find(".widgetarea-row:last-child").length > 0 && deletable) {
                                //가장 하위의 bottom DOM을 선택
                                $combineRow.find(".widgetarea-row:last-child .widgetarea").each(function() {
                                    var $widgetarea = $(this),
                                        widgetareaHeight = $widgetarea.height(),
                                        resetHeight = widgetareaHeight + targetHeight + 25;

                                    $widgetarea.setHeight(resetHeight);
                                });
                            }else {
                                //$combineRow가 .widgetarea-row 일때
                                var $widgetarea = $combineRow.find(".widgetarea"),
                                    widgetareaHeight = $widgetarea.height(),
                                    resetHeight = widgetareaHeight + targetHeight + 25;

                                $widgetarea.setHeight(resetHeight);
                            }

                        }else {
                            //없어야 정상
                            window.console.error("error 정의되지 않은 조건. ");
                        }
                    }

                }else {
                    if($selectedParentCol.siblings().length > 0) {
                        var size = parseInt($selectedParentCol.attr('class').match(/col-md-([0-9]+)/i)[1]) + parseInt($lastColumn.attr('class').match(/col-md-([0-9]+)/i)[1]);

                        var $siblingCol = ($selectedParentCol.next().length > 0)? $selectedParentCol.next() : $selectedParentCol.prev(),
                            siblingColHtml = $siblingCol.html();

                        $selectedParentCol.remove();
                        $siblingCol.removeAttr('class').addClass('xe-col-md-' + size);

                        if($siblingCol.siblings().length === 0) {
                            $siblingCol.closest(".xe-row").parent().append(siblingColHtml);
                            $siblingCol.closest(".xe-row").remove();
                        }

                    }else {
                        var $sTarget = $selectedParentRow.closest("div[class^='xe-col-']:not(.xe-col-md-12)").siblings();

                        $selectedParentRow.remove();

                        self.reduceBlock($sTarget);
                        $("[reduce=true]").removeAttr("reduce");

                    }
                }

                WidgetBox.deselectAll();
                WidgetBox.setOrdering();
            },
            /**
             * TODO
             * @param {jquery element} $selected 선택된 column
             * @description
             * <pre>
             *     - 삭제 될수 있는 block인지 상, 하, 좌, 우 합쳐져야하는 요소인지 확인
             *     1)줄어들어야 하는 height 수치 필요 (상하 병합 되면서 수치가 늘어날수 있음)
             *     2)상위 dom으로 올라가며 확인
             * </pre>
             * @return {boolean} deletable
             * */
            checkRowBlock: function($selected) {

                var targetHeight = $selected.find(".widgetarea").data("height");
                _deletable = true;

                var $divCol = $selected.parent().closest("div[class^='xe-col-']:not(.xe-col-md-12)");

                while(true) { //상위 col-xx을 찾음 12가 아닌것
                    if($divCol.length > 0 && _deletable) {
                        var $siblingCols = $divCol.siblings();




                        _deletable = self.checkRowChildBlock($siblingCols, targetHeight);

                        $divCol = $divCol.parent().closest("div[class^='xe-col-']:not(.xe-col-md-12)");

                    }else {
                        window.console.log("%c 최상위 col", "background:blue;color:#FFFFFF;font-weight:bold");
                        break;
                    }
                }


                window.console.log(":: deletable :: " + _deletable);

                return _deletable;

                // return deletable;

            },
            /**
             * TODO
             * @description 하위 dom을 내려가며 확인
             * */
            checkRowChildBlock: function($cols, targetHeight) {

                if(!_deletable) {
                    return false;
                }

                $cols.each(function() {

                    var $sCol = $(this);

                    if(!_deletable) {
                        return false;
                    }

                    if($sCol.find("> .xe-row").length > 0) {

                        var $lastRow = $sCol.find("> .xe-row:last");
                        var $target = $lastRow.find("> div[class^='xe-col-']:not(.xe-col-md-12)");

                        if($target.length === 0) {
                            $target = $lastRow.find(".xe-col-md-12");
                        }

                        _deletable = self.checkRowChildBlock($target, targetHeight);

                    }else {
                        //최하위 cols
                        if($sCol.find(".widgetarea").height() <= targetHeight) {
                            _deletable = false;
                            return false;
                        }

                    }

                });

                return _deletable;
            },
            reduceBlock: function($target) {
                if($target.length > 0) {

                    $target.each(function() {
                        var $targetPiece = $(this);

                        if($targetPiece.find("> .xe-row").length > 1) {
                            window.console.log("row");

                        }else {
                            if($targetPiece.find(".widgetarea-row:last-child:not(:has(.selected))").length > 0) {
                                $targetPiece.find(".widgetarea-row:last-child:not(:has(.selected))").find(".widgetarea").each(function() {

                                    var $widgetarea = $(this);

                                    if($widgetarea.height() > 140) {
                                        var height = $widgetarea.height() - 165;

                                        if (!$widgetarea.attr("reduce")) {
                                            $widgetarea.setHeight(height).attr("reduce", true);
                                        }

                                    }
                                });
                            }else {
                                $target = $targetPiece.find("> .xe-row > div[class^='xe-col-']");
                            }

                        }

                    });

                    self.reduceBlock($target.parents("div[class^='xe-col-']").siblings());
                }
            }
        };
    })();
})(window, WidgetBox);