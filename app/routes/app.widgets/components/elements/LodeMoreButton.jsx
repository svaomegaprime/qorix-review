export default function LodeMoreButton() {
  return (
    <>
      <style>{`
        .lodeMore_button {
          display: flex;
          justify-content: center;
          padding: 40px 0;
        }

        .lodeMore_button button {
          width: 193px;
          height: 52px;
          font-size: 16px;
          border-radius: 12px;
          padding: 16px 24px;
          font-weight: 500;
          gap: 10px;
          background: #f2f2f2;
          border: none;
          cursor: pointer;
        }
      `}</style>

      <div className="lodeMore_button">
        <button type="button">Load more reviews</button>
      </div>
    </>
  );
}
