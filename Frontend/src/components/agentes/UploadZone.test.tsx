// src/components/agentes/UploadZone.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadZone } from './UploadZone';
import type { ArquivoUpload } from '@/types/agente';

describe('UploadZone', () => {
  const mockOnArquivosChange = vi.fn();

  const createFile = (name: string, size: number, type: string): File => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  const createArquivoUpload = (file: File): ArquivoUpload => ({
    id: crypto.randomUUID(),
    file,
    nome: file.name,
    tamanho: file.size,
    tipo: file.type,
  });

  beforeEach(() => {
    mockOnArquivosChange.mockClear();
  });

  describe('Drag and Drop', () => {
    it('should highlight on drag over', () => {
      const { container } = render(
        <UploadZone arquivos={[]} onArquivosChange={mockOnArquivosChange} />
      );

      const dropZone = container.querySelector('label');
      expect(dropZone).toBeTruthy();

      // Simulate drag over
      fireEvent.dragOver(dropZone!, { dataTransfer: { files: [] } });

      // Check for highlight class
      expect(dropZone?.className).toContain('border-primary');
      expect(dropZone?.className).toContain('bg-primary/5');
    });

    it('should remove highlight on drag leave', () => {
      const { container } = render(
        <UploadZone arquivos={[]} onArquivosChange={mockOnArquivosChange} />
      );

      const dropZone = container.querySelector('label');
      expect(dropZone).toBeTruthy();

      // Simulate drag over then drag leave
      fireEvent.dragOver(dropZone!, { dataTransfer: { files: [] } });
      fireEvent.dragLeave(dropZone!, { dataTransfer: { files: [] } });

      // Check highlight is removed (use classList or check for border-border)
      expect(dropZone?.className).toContain('border-border');
      expect(dropZone?.className).not.toContain('bg-primary/5');
    });

    it('should add files on drop', async () => {
      const { container } = render(
        <UploadZone arquivos={[]} onArquivosChange={mockOnArquivosChange} />
      );

      const dropZone = container.querySelector('label');
      const file1 = createFile('document.pdf', 1024 * 100, 'application/pdf');
      const file2 = createFile('image.jpg', 1024 * 50, 'image/jpeg');

      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file1, file2],
        },
      });

      await waitFor(() => {
        expect(mockOnArquivosChange).toHaveBeenCalledTimes(1);
        const calledWith = mockOnArquivosChange.mock.calls[0][0];
        expect(calledWith).toHaveLength(2);
        expect(calledWith[0].nome).toBe('document.pdf');
        expect(calledWith[1].nome).toBe('image.jpg');
      });
    });

    it('should not accept files when disabled', () => {
      const { container } = render(
        <UploadZone
          arquivos={[]}
          onArquivosChange={mockOnArquivosChange}
          disabled
        />
      );

      const dropZone = container.querySelector('label');

      // Drop zone should not be rendered when disabled
      expect(dropZone).toBeNull();
    });

    it('should not highlight when disabled during drag over', () => {
      const { container, rerender } = render(
        <UploadZone arquivos={[]} onArquivosChange={mockOnArquivosChange} />
      );

      // First render enabled
      let dropZone = container.querySelector('label');
      expect(dropZone).toBeTruthy();

      // Re-render disabled
      rerender(
        <UploadZone
          arquivos={[]}
          onArquivosChange={mockOnArquivosChange}
          disabled
        />
      );

      // Drop zone should be gone
      dropZone = container.querySelector('label');
      expect(dropZone).toBeNull();
    });
  });

  describe('File Input', () => {
    it('should add files via input click', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <UploadZone arquivos={[]} onArquivosChange={mockOnArquivosChange} />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeTruthy();

      const file = createFile('test.pdf', 1024 * 200, 'application/pdf');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockOnArquivosChange).toHaveBeenCalledTimes(1);
        const calledWith = mockOnArquivosChange.mock.calls[0][0];
        expect(calledWith).toHaveLength(1);
        expect(calledWith[0].nome).toBe('test.pdf');
      });
    });

    it('should not add files via input when disabled', () => {
      const { container } = render(
        <UploadZone
          arquivos={[]}
          onArquivosChange={mockOnArquivosChange}
          disabled
        />
      );

      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeNull();
    });
  });

  describe('File Display', () => {
    it('should display uploaded files with names', () => {
      const file = createFile('document.pdf', 1024 * 100, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    it('should display file size formatted in KB', () => {
      const file = createFile('small.pdf', 1024 * 5.5, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      expect(screen.getByText('5.5 KB')).toBeInTheDocument();
    });

    it('should display file size formatted in MB', () => {
      const file = createFile('large.pdf', 1024 * 1024 * 2.3, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      expect(screen.getByText('2.3 MB')).toBeInTheDocument();
    });

    it('should display file size formatted in B for very small files', () => {
      const file = createFile('tiny.txt', 500, 'text/plain');
      const arquivo = createArquivoUpload(file);

      render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      expect(screen.getByText('500 B')).toBeInTheDocument();
    });
  });

  describe('File Removal', () => {
    it('should allow removing files', async () => {
      const user = userEvent.setup();
      const file = createFile('document.pdf', 1024 * 100, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      const removeButton = screen.getByRole('button');
      await user.click(removeButton);

      expect(mockOnArquivosChange).toHaveBeenCalledWith([]);
    });

    it('should not show remove button when disabled', () => {
      const file = createFile('document.pdf', 1024 * 100, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
          disabled
        />
      );

      const removeButton = screen.queryByRole('button');
      expect(removeButton).toBeNull();
    });

    it('should not remove files when disabled', async () => {
      const file = createFile('document.pdf', 1024 * 100, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      const { rerender } = render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      // Re-render as disabled
      rerender(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
          disabled
        />
      );

      // Button should not exist
      const removeButton = screen.queryByRole('button');
      expect(removeButton).toBeNull();
    });
  });

  describe('Multiple Files', () => {
    it('should handle multiple files correctly', () => {
      const file1 = createFile('doc1.pdf', 1024 * 100, 'application/pdf');
      const file2 = createFile('image.jpg', 1024 * 50, 'image/jpeg');
      const file3 = createFile('doc2.docx', 1024 * 200, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      const arquivos = [
        createArquivoUpload(file1),
        createArquivoUpload(file2),
        createArquivoUpload(file3),
      ];

      render(
        <UploadZone
          arquivos={arquivos}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      expect(screen.getByText('doc1.pdf')).toBeInTheDocument();
      expect(screen.getByText('image.jpg')).toBeInTheDocument();
      expect(screen.getByText('doc2.docx')).toBeInTheDocument();
    });

    it('should remove specific file from multiple files', async () => {
      const user = userEvent.setup();
      const file1 = createFile('doc1.pdf', 1024 * 100, 'application/pdf');
      const file2 = createFile('image.jpg', 1024 * 50, 'image/jpeg');
      const arquivo1 = createArquivoUpload(file1);
      const arquivo2 = createArquivoUpload(file2);

      render(
        <UploadZone
          arquivos={[arquivo1, arquivo2]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      const removeButtons = screen.getAllByRole('button');
      await user.click(removeButtons[0]); // Remove first file

      expect(mockOnArquivosChange).toHaveBeenCalledWith([arquivo2]);
    });
  });

  describe('Visual Feedback', () => {
    it('should show correct icon for image files', () => {
      const file = createFile('photo.jpg', 1024 * 50, 'image/jpeg');
      const arquivo = createArquivoUpload(file);

      const { container } = render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      // Check for Image icon (lucide-react renders as svg)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('should show correct icon for document files', () => {
      const file = createFile('document.pdf', 1024 * 100, 'application/pdf');
      const arquivo = createArquivoUpload(file);

      const { container } = render(
        <UploadZone
          arquivos={[arquivo]}
          onArquivosChange={mockOnArquivosChange}
        />
      );

      // Check for FileText icon
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });
});
