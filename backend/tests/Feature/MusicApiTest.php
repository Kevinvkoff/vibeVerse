<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Models\Track;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MusicApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_tracks_endpoint_returns_tracks_with_artist_and_album(): void
    {
        $artist = Artist::create(['name' => 'M83']);
        Track::create([
            'artist_id' => $artist->id,
            'title' => 'Midnight City',
            'genre' => 'Électro',
            'duration_seconds' => 243,
        ]);

        $this->getJson('/api/tracks')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Midnight City')
            ->assertJsonPath('data.0.artist.name', 'M83')
            ->assertJsonPath('data.0.album', null);
    }

    public function test_track_search_is_case_insensitive_for_title_and_artist(): void
    {
        $artist = Artist::create(['name' => 'Petit Biscuit']);
        Track::create(['artist_id' => $artist->id, 'title' => 'Sunset Lover']);

        $this->getJson('/api/tracks?search=PETIT')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Sunset Lover');
    }
}
