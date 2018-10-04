<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Search\Searchable;

class Task extends Model
{
    use Searchable;

    public $searchColumns = [
        'column_name' => 'where|betweenDates|checkedByDate',
        'relation.column_name' => 'where|betweenDates|checkedByDate',
    ];
}
