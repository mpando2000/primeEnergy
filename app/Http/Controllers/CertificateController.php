<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function adminIndex()
    {
        return Inertia::render('Admin/Certificates', [
            'certificates' => Certificate::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_sw' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:2048',
            'is_active' => 'nullable|boolean',
        ]);

        $fileData = $this->storeFile($request);

        Certificate::create([
            'name' => $validated['name'],
            'name_sw' => $validated['name_sw'],
            ...$fileData,
            'sort_order' => (Certificate::max('sort_order') ?? -1) + 1,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->back()->with('success', 'Certificate uploaded successfully.');
    }

    public function update(Request $request, Certificate $certificate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_sw' => 'required|string|max:255',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:2048',
            'is_active' => 'nullable|boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'name_sw' => $validated['name_sw'],
            'is_active' => $request->boolean('is_active'),
        ];
        $oldPath = null;

        if ($request->hasFile('file')) {
            $oldPath = $certificate->file_path;
            $data = [...$data, ...$this->storeFile($request)];
        }

        $certificate->update($data);

        if ($oldPath && str_starts_with($oldPath, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $oldPath));
        }

        return redirect()->back()->with('success', 'Certificate updated successfully.');
    }

    public function destroy(Certificate $certificate)
    {
        $filePath = $certificate->file_path;

        $certificate->delete();

        if (str_starts_with($filePath, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $filePath));
        }

        return redirect()->back()->with('success', 'Certificate deleted successfully.');
    }

    public function toggleActive(Certificate $certificate)
    {
        $certificate->update(['is_active' => ! $certificate->is_active]);

        return redirect()->back()->with('success', 'Certificate visibility updated.');
    }

    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:certificates,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $item) {
                Certificate::whereKey($item['id'])->update(['sort_order' => $item['sort_order']]);
            }
        });

        return redirect()->back()->with('success', 'Certificate order updated.');
    }

    private function storeFile(Request $request): array
    {
        $file = $request->file('file');
        $path = $file->store('certificates', 'public');

        return [
            'file_path' => '/storage/'.$path,
            'file_type' => $file->getMimeType() === 'application/pdf' ? 'pdf' : 'image',
            'original_name' => $file->getClientOriginalName(),
        ];
    }
}
