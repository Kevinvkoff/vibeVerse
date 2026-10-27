<?php

namespace Database\Seeders;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Playlist;
use App\Models\Track;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            ['title' => 'Midnight City', 'artist' => 'M83', 'album' => 'Hurry Up, We’re Dreaming', 'genre' => 'Électro', 'duration' => 243, 'cover' => 'photo-1470225620780-dba8ba36b745'],
            ['title' => 'The Less I Know The Better', 'artist' => 'Tame Impala', 'album' => 'Currents', 'genre' => 'Indie', 'duration' => 216, 'cover' => 'photo-1500530855697-b586d89ba3ee'],
            ['title' => 'Sunset Lover', 'artist' => 'Petit Biscuit', 'album' => 'Presence', 'genre' => 'Électro', 'duration' => 237, 'cover' => 'photo-1470252649378-9c29740c9fa8'],
            ['title' => 'Feels Like We Only Go Backwards', 'artist' => 'Tame Impala', 'album' => 'Lonerism', 'genre' => 'Indie', 'duration' => 192, 'cover' => 'photo-1518837695005-2083093ee35b'],
            ['title' => 'Instant Crush', 'artist' => 'Daft Punk', 'album' => 'Random Access Memories', 'genre' => 'Électro', 'duration' => 337, 'cover' => 'photo-1519608487953-e999c86e7455'],
        ];

        foreach ($catalog as $entry) {
            $artist = Artist::firstOrCreate(['name' => $entry['artist']]);
            $album = Album::firstOrCreate(
                ['artist_id' => $artist->id, 'title' => $entry['album']],
                ['cover_url' => "https://images.unsplash.com/{$entry['cover']}?auto=format&fit=crop&w=480&q=85"],
            );

            Track::firstOrCreate(
                ['title' => $entry['title'], 'artist_id' => $artist->id],
                [
                    'album_id' => $album->id,
                    'cover_url' => "https://images.unsplash.com/{$entry['cover']}?auto=format&fit=crop&w=480&q=85",
                    'genre' => $entry['genre'],
                    'duration_seconds' => $entry['duration'],
                ],
            );
        }

        foreach (['Nuits électriques', 'Soleil dans les écouteurs', 'Indie, toujours', 'Loin du bruit'] as $name) {
            Playlist::firstOrCreate(['name' => $name], ['is_public' => true]);
        }
    }
}
