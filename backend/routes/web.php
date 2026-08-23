<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

Route::get('/', function () {
    $path = base_path('../frontend/dist/index.html');
    if (File::exists($path)) {
        return Response::make(File::get($path), 200, ['Content-Type' => 'text/html']);
    }
    return view('welcome');
});

Route::get('/assets/{file}', function ($file) {
    $path = base_path('../frontend/dist/assets/' . $file);
    if (File::exists($path)) {
        $mime = File::mimeType($path);
        if (str_ends_with($file, '.css')) {
            $mime = 'text/css';
        } elseif (str_ends_with($file, '.js')) {
            $mime = 'application/javascript';
        }
        return response()->file($path, ['Content-Type' => $mime]);
    }
    abort(404);
});

Route::fallback(function () {
    $path = base_path('../frontend/dist/index.html');
    if (File::exists($path)) {
        return Response::make(File::get($path), 200, ['Content-Type' => 'text/html']);
    }
    abort(404);
});



