<?php

namespace App\Exports\Sheets;

use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PrayerPerClassroomSheet implements FromCollection, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    private CarbonPeriod $period;

    public function __construct(
        private $classroom,
        private Collection $students,
        private string $dateFrom,
        private string $dateTo,
        private array $attendedMap,
    ) {
        $this->period = CarbonPeriod::create($this->dateFrom, $this->dateTo);
    }

    public function title(): string
    {
        return $this->classroom->name;
    }

    public function headings(): array
    {
        $headers = ['No', 'Kelas', 'Nama', 'NIS'];

        foreach ($this->period as $date) {
            $headers[] = $date->format('Y-m-d');
        }

        $headers[] = 'Jml Tidak Hadir';

        return $headers;
    }

    public function collection()
    {
        $rows = [];
        $no = 1;

        foreach ($this->students as $student) {
            $row = [
                $no,
                $this->classroom->name,
                $student->name,
                $student->nis ?? '-',
            ];

            $totalAbsent = 0;
            foreach ($this->period as $date) {
                $dateKey = $date->format('Y-m-d');
                $isAttended = isset($this->attendedMap[$student->id][$dateKey]);

                if ($isAttended) {
                    $row[] = '';
                } else {
                    $row[] = 'X';
                    $totalAbsent++;
                }
            }

            $row[] = $totalAbsent;
            $rows[] = $row;
            $no++;
        }

        return collect($rows);
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = $sheet->getHighestColumn();
        $lastColIndex = Coordinate::columnIndexFromString($lastCol);

        $sheet->getStyle('A1:'.$lastCol.'1')->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFE0E0E0'],
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        if ($lastRow > 1) {
            $sheet->getStyle('A2:'.$lastCol.$lastRow)
                ->getBorders()->getAllBorders()
                ->setBorderStyle(Border::BORDER_THIN);
        }

        if ($lastRow > 1) {
            for ($row = 2; $row <= $lastRow; $row++) {
                for ($colIndex = 5; $colIndex < $lastColIndex; $colIndex++) {
                    $colLetter = Coordinate::stringFromColumnIndex($colIndex);
                    $cell = $sheet->getCell($colLetter.$row);
                    $cell->getStyle()->getAlignment()
                        ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                    if ($cell->getValue() === 'X') {
                        $cell->getStyle()->applyFromArray([
                            'font' => [
                                'color' => ['argb' => 'FFFF0000'],
                                'bold' => true,
                            ],
                        ]);
                    }
                }
            }
        }

        $lastColLetter = Coordinate::stringFromColumnIndex($lastColIndex);
        if ($lastRow > 1) {
            $sheet->getStyle($lastColLetter.'2:'.$lastColLetter.$lastRow)
                ->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER);

            for ($row = 2; $row <= $lastRow; $row++) {
                $cellValue = $sheet->getCell($lastColLetter.$row)->getValue();
                if ($cellValue !== null && (int) $cellValue > 0) {
                    $sheet->getStyle($lastColLetter.$row)->applyFromArray([
                        'font' => [
                            'color' => ['argb' => 'FFFF0000'],
                            'bold' => true,
                        ],
                    ]);
                }
            }
        }
    }
}
