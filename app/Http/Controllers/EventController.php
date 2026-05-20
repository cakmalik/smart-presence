<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\School;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::query()
            ->latest()
            ->paginate(10)
            ->through(fn (Event $event) => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'start_date' => $event->start_date->format('d M Y'),
                'end_date' => $event->end_date?->format('d M Y'),
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'location' => $event->location,
                'status' => $event->status,
                'created_at' => $event->created_at->format('d M Y'),
            ]);

        return Inertia::render('events/index', [
            'events' => $events,
        ]);
    }

    public function create(): Response
    {
        $schools = auth()->user()->isSuperadmin()
            ? School::query()->where('status', 'active')->get(['id', 'name'])
            : collect();

        return Inertia::render('events/create', [
            'schools' => $schools,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:draft,active,completed,cancelled'],
        ];

        if ($user->isSuperadmin()) {
            $rules['school_id'] = ['required', 'exists:schools,id'];
        }

        $validated = $request->validate($rules);

        if (! $user->isSuperadmin()) {
            $validated['school_id'] = $user->school_id;
        }

        Event::create($validated);

        return redirect()->route('events.index')->with('success', 'Event berhasil ditambahkan.');
    }

    public function edit(Event $event): Response
    {
        $schools = auth()->user()->isSuperadmin()
            ? School::query()->where('status', 'active')->get(['id', 'name'])
            : collect();

        return Inertia::render('events/edit', [
            'event' => [
                'id' => $event->id,
                'name' => $event->name,
                'description' => $event->description,
                'start_date' => $event->start_date->format('Y-m-d'),
                'end_date' => $event->end_date?->format('Y-m-d'),
                'start_time' => $event->start_time,
                'end_time' => $event->end_time,
                'location' => $event->location,
                'status' => $event->status,
                'school_id' => $event->school_id,
            ],
            'schools' => $schools,
        ]);
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:draft,active,completed,cancelled'],
        ]);

        $event->update($validated);

        return redirect()->route('events.index')->with('success', 'Event berhasil diperbarui.');
    }

    public function destroy(Event $event): RedirectResponse
    {
        $event->delete();

        return redirect()->route('events.index')->with('success', 'Event berhasil dihapus.');
    }
}
