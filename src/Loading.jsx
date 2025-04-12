

const Loading = () => {
  return (
    <div
      className="loading-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}
    >
      <img
        src='car-spinner.gif'
        alt="Loading..."
        style={{
          width: '100px',
          height: '100px',
          marginBottom: '20px',
        }}
      />
    </div>
  );
};

export default Loading;
