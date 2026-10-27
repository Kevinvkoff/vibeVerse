<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Playlist;
use App\Models\Track;
use Illuminate\Http\Request;

class MusicController extends Controller
{
    public function index(Request $request)
    {
        $query = Track::query()->with(['artist', 'album']);

        if ($request->filled('search')) {
            $search = mb_strtolower($request->string('search')->toString());
            $query->where(function ($tracks) use ($search) {
                $term = "%{$search}%";
                $tracks->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereHas('artist', fn ($artists) => $artists->whereRaw('LOWER(name) LIKE ?', [$term]));
            });
        }

        return response()->json($query->orderBy('title')->paginate(20));
    }

    public function show(Track $track)
    {
        return response()->json($track->load(['artist', 'album']));
    }

    public function playlists()
    {
        return response()->json(Playlist::query()->latest()->get());
    }
}
