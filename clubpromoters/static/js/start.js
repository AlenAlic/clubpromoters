(function() {
    var AdminForm = function() {
      // Field converters
      var fieldConverters = [];

      /**
      * Process data-role attribute for the given input element. Feel free to override
      *
      * @param {Selector} $el jQuery selector
      * @param {String} name data-role value
      */
      this.applyStyle = function($el, name) {
        // Process converters first
        for (var conv in fieldConverters) {
            var fieldConv = fieldConverters[conv];

            if (fieldConv($el, name))
                return true;
        }

        switch (name) {
            case 'datepicker':
                $el.daterangepicker({
                  timePicker: false,
                  showDropdowns: true,
                  singleDatePicker: true,
                  format: $el.attr('data-date-format')
                },
                function(start, end) {
                    $('.filter-val').trigger("change");
                });
                return true;
            case 'daterangepicker':
                $el.daterangepicker({
                  timePicker: false,
                  showDropdowns: true,
                  separator: ' to ',
                  format: $el.attr('data-date-format')
                },
                function(start, end) {
                    $('.filter-val').trigger("change");
                });
                return true;
            case 'datetimepicker':
                $el.daterangepicker({
                  timePicker: true,
                  showDropdowns: true,
                  singleDatePicker: true,
                  timePickerIncrement: 1,
                  timePicker12Hour: false,
                  format: $el.attr('data-date-format')
                },
                function(start, end) {
                    $('.filter-val').trigger("change");
                });
                $el.on('show.daterangepicker', function (event, data) {
                  if ($el.val() == "") {
                    var now = moment().seconds(0); // set seconds to 0
                    // change datetime to current time if field is blank
                    $el.data('daterangepicker').setCustomDates(now, now);
                  }
                });
                return true;
            case 'datetimerangepicker':
                $el.daterangepicker({
                  timePicker: true,
                  showDropdowns: true,
                  timePickerIncrement: 1,
                  timePicker12Hour: false,
                  separator: ' to ',
                  format: $el.attr('data-date-format')
                },
                function(start, end) {
                    $('.filter-val').trigger("change");
                });
                return true;
            case 'timepicker':
                $el.daterangepicker({
                  // Bootstrap 2 option
                  timePicker: true,
                  showDropdowns: true,
                  format: $el.attr('data-date-format'),
                  timePicker12Hour: false,
                  timePickerIncrement: 1,
                  singleDatePicker: true
                },
                function(start, end) {
                    $('.filter-val').trigger("change");
                });
                // hack to hide calendar to create a time-only picker
                $el.data('daterangepicker').container.find('.calendar-date').hide();
                $el.on('showCalendar.daterangepicker', function (event, data) {
                    var $container = data.container;
                    $container.find('.calendar-date').remove();
                });
                return true;
            case 'timerangepicker':
                $el.daterangepicker({
                  // Bootstrap 2 option
                  timePicker: true,
                  showDropdowns: true,
                  format: $el.attr('data-date-format'),
                  timePicker12Hour: false,
                  separator: ' to ',
                  timePickerIncrement: 1
                },
                function(start, end) {
                    $('.filter-val').trigger("change");
                });
                // hack - hide calendar + range inputs
                $el.data('daterangepicker').container.find('.calendar-date').hide();
                $el.data('daterangepicker').container.find('.daterangepicker_start_input').hide();
                $el.data('daterangepicker').container.find('.daterangepicker_end_input').hide();
                // hack - add TO between time inputs
                $el.data('daterangepicker').container.find('.left').before($('<div style="float: right; margin-top: 20px; padding-left: 5px; padding-right: 5px;"> to </span>'));
                $el.on('showCalendar.daterangepicker', function (event, data) {
                    var $container = data.container;
                    $container.find('.calendar-date').remove();
                });
                return true;
        }
      };

      /**
      * Apply global input styles.
      *
      * @method applyGlobalStyles
      * @param {Selector} jQuery element
      */
      this.applyGlobalStyles = function(parent) {
        var self = this;

        $(':input[data-role], a[data-role]', parent).each(function() {
            var $el = $(this);
            self.applyStyle($el, $el.attr('data-role'));
        });
      };
    };

    // Add on event handler
    $('body').on('click', '.inline-remove-field' , function(e) {
        e.preventDefault();
        var r = confirm($('.inline-remove-field').attr('value'));
        var form = $(this).closest('.inline-field');
        if ( r == true ){
        form.remove();
      }
    });

    // Expose faForm globally
    var faForm = window.faForm = new AdminForm();

    // Apply global styles for current page after page loaded
    $(function() {
        faForm.applyGlobalStyles(document);
    });
})();
