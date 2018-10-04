<style type="text/css">
.content form input, .content form select {
    max-width: 100%;
}
</style>

<form method="POST" action="{{ route('filter') }}" class="form-horizontal filterForm">
    {{ csrf_field() }}
    <div class="filters-container"></div>
     <div class="form-group">
        <div class="col-md-12"> 
            <hr style="margin-top: 0px;">
            <button type="submit" class="btn btn-primary btn-search"><i class="fa fa-search" aria-hidden="true"></i>&ensp;Zoeken</button>
            <span class="pull-right">
                <button type="button" class="btn btn-warning btn-reset"><i class="fa fa-times" aria-hidden="true"></i>&ensp;Reset filter</button>
            </span>
        </div>
    </div>
</form>

<script src="{{ asset('vendor/jquery/dist/jquery.min.js') }}"></script>
<script src="{{ asset('main/js/advancedSearch.js') }}"></script>
<script>
AdvancedSearch.init({
   'column_name': {
        text: 'Display Name',
        type: 'where|between_dates|true-false'
    },
    'relation.column_name': {
        text: 'Display Name',
        type: 'where|between_dates|true-false'
    },
});
</script>
