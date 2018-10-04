var AdvancedSearch = {
    init: function(columns) {
        // Set counters
        itemCounter = 0;
        groupCounter = 0;

        // Set initial filter
        addAndFilter('.filters-container', true);

        // Restore saved filter session
        if(typeof(Storage)!=="undefined" && sessionStorage.getItem('filter:'+window.location.pathname)) {
            var html = sessionStorage.getItem('filter:'+window.location.pathname);
            $('.filters-container').html(html);
        }

        $('.btn-search').on('click', function(){
            // Store input values
            $('.filters-container input, .filters-container select').each(function(){
                if($(this).is('select')) {
                    $(this).find('option:selected').attr('selected', 'selected'); 
                } else { 
                    $(this).attr('value', $(this).val()); 
                }
            });

            // Save filter session
            if(typeof(Storage)!=="undefined") {
                var html = $('.filters-container').html();
                sessionStorage.setItem('filter:'+window.location.pathname, html);
            }
        });

        $('.btn-reset').on('click', function(){
            // Restore initial filter
            addAndFilter('.filters-container', true);

            // Remove filter session
            sessionStorage.removeItem('filter:'+window.location.pathname);
        });

        $(document).on('click','.btn-addAndFilter', function() {
            // Add new filter group
            addAndFilter($(this).closest('.f-group'));
        });

        $(document).on('click','.btn-addOrFilter', function() {
            // Add new filter to group
            var groupId = $(this).attr('data-group-id');
            addOrFilter(groupId, $(this).closest('.f-item'));
        });

        $(document).on('change','.columnSelector', function() {
            // Handle filter selector
            var content = $(this).parent().next().children().first();
            var groupId = $(this).attr('data-group-id');
            var itemId = $(this).attr('data-item-id');
            var html = '<span style="line-height:30px;">- Kies een kolom om op te filteren -</span>';

            if ($(this).val() !== '') {
                var column = columns[$(this).val()];

                if (column['type'] == 'where') {
                    content.html(getFilterWhere(groupId, itemId));
                }
                else if (column['type'] == 'true-false') {
                    content.html(getFilterTrueFalse(groupId, itemId));
                }
                else if (column['type'] == 'between_dates') {
                    content.html(getFilterBetweenDates(groupId, itemId));
                } else {
                    content.html(html);
                }
            } else {
                content.html(html);
            }
        });

        /**  
         *  
         *  Add AND filter-group
         *  
         */

        function addAndFilter(after, initial = false) {
            var html =  '<div class="f-group f-group-'+groupCounter+'">';
                html +=     getFilterItem(groupCounter, itemCounter);
                html +=     '<div class="form-group">';
                html +=         '<div class="col-md-12">';
                html +=             '<button type="button" data-group-id="'+groupCounter+'" data-item-id="'+itemCounter+'" class="btn btn-sm btn-addAndFilter">EN</button>';
                html +=         '</div>';
                html +=     '</div>';
                html += '</div>';
            
            if (initial) {
                $(after).html(html);
            } else {
                $(html).insertAfter(after);
            }

            itemCounter++;
            groupCounter++;
        }

        /**  
         *  
         *  Add OR filter-item
         *  
         */

        function addOrFilter(groupId, after) {
            var html = getFilterItem(groupId, itemCounter);
            
            $(html).insertAfter(after);
            
            itemCounter++;
        }

        /**  
         *  
         *  Get filter HTML
         *  
         */

        function getFilterItem(groupId, itemId) {
            var html =  '<div class="form-group f-item f-item-'+itemId+'">';
                html +=     '<div class="col-md-3 f-selector">'+getColumnSelector(groupId, itemId)+'</div>';
                html +=     '<div class="col-md-9">';
                html +=         '<span class="f-content"><span style="line-height:30px;">- Kies een kolom om op te filteren -</span></span>';
                html +=         '<span class="pull-right"><button type="button" data-group-id="'+groupId+'" data-item-id="'+itemId+'" class="btn btn-sm btn-addOrFilter">OF</button></span>';
                html +=     '</div>';
                html += '</div>';

            return html;
        }

        /**  
         *  
         *  Get column selector-field HTML
         *  
         */

        function getColumnSelector(groupId, itemId) {
            var html =  '<select name="filter['+groupId+']['+itemId+'][column]" class="form-control input-sm columnSelector" data-group-id="'+groupId+'" data-item-id="'+itemId+'">';
                html +=     getColumnOptions();
                html += '</select>';

            return html;
        }

        function getColumnOptions() {
            var html =  '<option value="">- Selecteer -</option>';

            for(var key in columns) {
                html += '<option value="'+key+'">'+columns[key]["text"]+'</option>';
            };

            return html;
        }

        /**  
         *  
         *  Get Where-filter HTML
         *  
         */

        function getFilterWhere(groupId, itemId) {
            var html =  '<div class="col-md-4 filter-item">';
                html +=     '<select name="filter['+groupId+']['+itemId+'][operator]" class="form-control input-sm">';
                html +=         '<option value="contains">bevat</option>';
                html +=         '<option value="does_not_contain">bevat niet</option>';
                html +=         '<option value="equals">gelijk aan</option>';
                html +=         '<option value="not_equal">niet gelijk aan</option>';
                html +=         '<option value="starts_with">begint met</option>';
                html +=         '<option value="ends_with">eindigt met</option>';
                html +=         '<option value="does_not_start_with">begint niet met</option>';
                html +=         '<option value="does_not_end_with">eindigt niet met</option>';
                html +=         '<option value="gt">></option>';
                html +=         '<option value="gte">>=</option>';
                html +=         '<option value="st"><</option>';
                html +=         '<option value="ste"><=</option>';
                html +=     '</select>';
                html += '</div>';
                html += '<div class="col-md-6">';
                html +=     '<input name="filter['+groupId+']['+itemId+'][value]" type="text" class="form-control input-sm">';
                html += '</div>';

            return html;
        }

        /**  
         *  
         *  Get Between Dates-filter HTML
         *  
         */

        function getFilterBetweenDates(groupId, itemId) {
            var html =  '';
                html +=  '<div class="col-md-5 filter-item">';
                html +=     '<input name="filter['+groupId+']['+itemId+'][start_value]" type="text" class="form-control input-sm" placeholder="Van: dd-mm-jjjj">';
                html += '</div>';
                html += '<div class="col-md-5">';
                html +=     '<input name="filter['+groupId+']['+itemId+'][end_value]" type="text" class="form-control input-sm" placeholder="T/m: dd-mm-jjjj">';
                html += '</div>';

            return html;
        }

        /**  
         *  
         *  Get True/False-filter HTML
         *  
         */
                     
        function getFilterTrueFalse(groupId, itemId) {
            var html =  '<div class="col-md-4 filter-item">';
                html +=     '<select name="filter['+groupId+']['+itemId+'][value]" class="form-control input-sm">';
                html +=         '<option value="on">Ja</option>';
                html +=         '<option value="">Nee</option>';
                html +=     '</select>';
                html += '</div>';

            return html;
        }

        /**  
         *  
         *  Get checkbox-filter HTML
         *  
         */
                     
        function getFilterCheckbox(groupId, itemId) {
            var html =  '<div class="col-md-10 filter-item">';
                html +=     '<div class="checkbox"><label><input type="checkbox" name="filter['+groupId+']['+itemId+'][value]"></label></div>';
                html += '</div>';

            return html;
        }

    },
}
