<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Model;

class SomeController extends Controller
{
    public function index(Request $request, Model $model)
    {
        return view('view', [
            'records' => $model->search($request)->get(),
        ]);
    }
}
