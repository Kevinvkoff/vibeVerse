<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Playlist extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'cover_url', 'is_public'];

    public function tracks(): BelongsToMany
    {
        return $this->belongsToMany(Track::class)->withPivot('position')->orderByPivot('position');
    }
}
