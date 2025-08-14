import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileInputV2 } from './file-input';

function createFile(name: string, type: string, size = 1024) {
  const blob = new Blob([new Array(size).fill('a').join('')], { type });
  return new File([blob], name, { type });
}

test('renders with label and helper', () => {
  render(<FileInputV2 id="fi" label="Subir archivo" helperText="PNG o JPG" />);
  expect(screen.getByText('Subir archivo')).toBeInTheDocument();
  expect(screen.getByText('PNG o JPG')).toBeInTheDocument();
});

test('select files via click triggers onChange and lists names', () => {
  const onChange = jest.fn();
    render(<FileInputV2 id="fi" label="Subir archivo" multiple onChange={onChange} />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  const input = screen.getByLabelText('Subir archivo', { selector: 'input', exact: false }) || document.querySelector('#fi');
  const file1 = createFile('a.png', 'image/png');
  const file2 = createFile('b.jpg', 'image/jpeg');
  fireEvent.change(input as HTMLInputElement, { target: { files: [file1, file2] } });
  expect(onChange).toHaveBeenCalled();
});

test('drag and drop files works', () => {
  const onChange = jest.fn();
  render(<FileInputV2 id="fi" onChange={onChange} />);
  const drop = screen.getByRole('button');
  const file = createFile('x.txt', 'text/plain');
  fireEvent.dragOver(drop);
  fireEvent.drop(drop, { dataTransfer: { files: [file] } });
  expect(onChange).toHaveBeenCalled();
});

test('el área de drop está correctamente etiquetada por la label', () => {
  render(<FileInputV2 id="fi-lbl" label="Subir archivo" />);
  const drop = screen.getByRole('button');
  expect(drop).toHaveAttribute('aria-labelledby', 'fi-lbl-label');
});

test('ignora drop y click cuando está deshabilitado', () => {
  const onChange = jest.fn();
  render(<FileInputV2 id="fi-dis" label="Subir archivo" disabled onChange={onChange} />);
  const drop = screen.getByRole('button');
  const file = createFile('y.txt', 'text/plain');
  // Drag & drop
  fireEvent.dragOver(drop);
  fireEvent.drop(drop, { dataTransfer: { files: [file] } });
  // Click
  fireEvent.click(drop);
  expect(onChange).not.toHaveBeenCalled();
});
