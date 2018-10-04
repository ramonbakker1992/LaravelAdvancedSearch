<?php

namespace App\Search;

use Illuminate\Http\Request;

trait Searchable
{
    public function search($request) {
    	// Set new builder
        $builder = $this->query();

    	// Loop through all filter groups
    	foreach ($request->only('filter')['filter'] as $filterGroupId => $filterGroup) {
    		$filterGroup = array_values($filterGroup); // Optional ?

	    	// Instantiate an query group so multiple queries can be added. Works also for single queries.
	    	$builder = $builder->where(function ($query) use ($filterGroup) {

	    		// Loop through all filters
				foreach ($filterGroup as $filter) {
					// Column gets overwritten but we still need it
					$column = $filter['column'];

					if (!$filter['column']) {
						continue;
					}

					if ($this->columnIsRelation($filter)) {

						// Split the relationships table and column
						list($filter['relation'], $filter['column']) = $this->parseRelation($filter);

						// Add the query on the relationship
						$query->whereHas($filter['relation'], function($query) use ($filter, $column) {

							// Add relationship-filter based on column type
							if ($this->searchColumns[$column] == 'where') {
								$this->buildWhereQuery($query, $filter);
							}
							if ($this->searchColumns[$column] == 'checkedByDate') {
								$this->buildCheckedByDateQuery($query, $filter);
							}
							if ($this->searchColumns[$column] == 'betweenDates') {
								$this->buildBetweenDatesQuery($query, $filter);
							}

						});

					} else { // Not querying a relationship

						// Add filter based on column type.
						if ($this->searchColumns[$column] == 'where') {
							$this->buildOrWhereQuery($query, $filter);
						}
						if ($this->searchColumns[$column] == 'checkedByDate') {
							$this->buildOrCheckedByDateQuery($query, $filter);
						}
						if ($this->searchColumns[$column] == 'betweenDates') {
							$this->buildOrBetweenDatesQuery($query, $filter);
						}
					}

				}

			});
	    }

	    return $builder;
    }

    public function buildWhereQuery($query, $filter) {
    	return $query->where(
    		$filter['column'], 
    		$this->parseWhereOperator($filter), 
    		$this->parseWhereValue($filter)
    	);
    }

    public function buildOrWhereQuery($query, $filter) {
    	return $query->orWhere(
    		$filter['column'], 
    		$this->parseWhereOperator($filter), 
    		$this->parseWhereValue($filter)
    	);
    }

    public function buildCheckedByDateQuery($query, $filter) {
    	if ($filter['value'] == 'on') {
    		return $query->whereNotNull($filter['column']);
    	}
    	return $query->whereNull($filter['column']);
    }

    public function buildOrCheckedByDateQuery($query, $filter) {
    	if ($filter['value'] == 'on') {
    		return $query->orWhereNotNull($filter['column']);
    	}
    	return $query->orWhereNull($filter['column']);
    }

    public function buildBetweenDatesQuery($query, $filter) {
    	if (!$filter['start_value'] && !$filter['end_value']) {
    		return $query->whereNull($filter['column']);
    	}

    	$start = $filter['start_value'] ? date('Y-m-d 00:00:00', strtotime($filter['start_value'])) : '0000-00-00 00:00:00';
    	$end   = $filter['end_value']   ? date('Y-m-d 23:59:59', strtotime($filter['end_value']))   : '9999-12-31 23:59:59';

    	return $query->whereBetween($filter['column'], [$start, $end]);
    }

    public function buildOrBetweenDatesQuery($query, $filter) {
    	if (!$filter['start_value'] && !$filter['end_value']) {
    		return $query->orWhereNull($filter['column']);
    	}

    	$start = $filter['start_value'] ? date('Y-m-d 00:00:00', strtotime($filter['start_value'])) : '0000-00-00 00:00:00';
    	$end   = $filter['end_value']   ? date('Y-m-d 23:59:59', strtotime($filter['end_value']))   : '9999-12-31 23:59:59';

    	return $query->orWhereBetween($filter['column'], [$start, $end]);
    }

    public function columnIsRelation($filter) {
    	return count($this->parseRelation($filter)) === 2;
    }

    public function parseRelation($filter) {
    	return explode('.', $filter['column']);
    }

    public function parseWhereOperator($filter) {
    	switch ($filter['operator']) {
    		case 'contains':
    			return 'LIKE';
    			break;

    		case 'does_not_contain':
    			return 'NOT LIKE';
    			break;

    		case 'starts_with':
    			return 'LIKE';
    			break;

    		case 'ends_with':
    			return 'LIKE';
    			break;

    		case 'does_not_start_with':
    			return 'NOT LIKE';
    			break;

    		case 'does_not_end_with':
    			return 'NOT LIKE';
    			break;

    		case 'equals':
    			return '=';
    			break;

    		case 'not_equal':
    			return '!=';
    			break;

    		case 'gt':
    			return '>';
    			break;

    		case 'st':
    			return '<';
    			break;

    		case 'gte':
    			return '>=';
    			break;

    		case 'ste':
    			return '<=';
    			break;
    	}
    }

    public function parseWhereValue($filter) {
    	switch ($filter['operator']) {
    		case 'contains':
    			return '%'.$filter['value'].'%';
    			break;

    		case 'starts_with':
    			return $filter['value'].'%';
    			break;

    		case 'ends_with':
    			return '%'.$filter['value'];
    			break;

    		case 'does_not_contain':
    			return '%'.$filter['value'].'%';
    			break;

    		case 'does_not_start_with':
    			return $filter['value'].'%';
    			break;

    		case 'does_not_end_with':
    			return '%'.$filter['value'];
    			break;

    		default:
    			return $filter['value'];
    			break;
    	}
    }
}
