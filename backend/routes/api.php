<?php

use App\Http\Controllers\Api\MusicController;
use Illuminate\Support\Facades\Route;

Route::get('/tracks', [MusicController::class, 'index']);
Route::get('/tracks/{track}', [MusicController::class, 'show']);
Route::get('/playlists', [MusicController::class, 'playlists']);
